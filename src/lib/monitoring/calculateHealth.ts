import { db } from '../../db/index.ts';
import { monitorChecks, monitors, projects, projectErrors, projectMetrics } from '../../db/schema.ts';
import { eq, and, gte, sql } from 'drizzle-orm';

export interface ProjectUptimeStats {
  uptimePercentage: number | null;
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageResponseTimeMs: number;
  minResponseTimeMs: number;
  maxResponseTimeMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
}

export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

export async function getProjectUptimeStats(
  projectId: number,
  timeWindowDays: number = 30
): Promise<ProjectUptimeStats> {
  // Compute date threshold
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeWindowDays);

  // 1. Fetch active monitors for this project
  const activeMonitors = await db.select({ id: monitors.id })
    .from(monitors)
    .where(eq(monitors.projectId, projectId));

  if (activeMonitors.length === 0) {
    return {
      uptimePercentage: null,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTimeMs: 0,
      minResponseTimeMs: 0,
      maxResponseTimeMs: 0,
      p50Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
    };
  }

  const monitorIds = activeMonitors.map(m => m.id);

  // 2. Fetch all historical checks within the window
  const checks = await db.select()
    .from(monitorChecks)
    .where(and(
      sql`monitor_id IN (${sql.join(monitorIds, sql`, `)})`,
      gte(monitorChecks.checkedAt, cutoffDate)
    ));

  if (checks.length === 0) {
    return {
      uptimePercentage: null,
      totalChecks: 0,
      successfulChecks: 0,
      failedChecks: 0,
      averageResponseTimeMs: 0,
      minResponseTimeMs: 0,
      maxResponseTimeMs: 0,
      p50Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
    };
  }

  const totalChecks = checks.length;
  const successfulChecks = checks.filter(c => c.status === 'UP').length;
  const failedChecks = totalChecks - successfulChecks;

  const uptimePercentage = totalChecks > 0 ? (successfulChecks / totalChecks) * 100 : 0;

  // Extract valid response times for metrics
  const responseTimes = checks
    .map(c => c.responseTimeMs)
    .filter((t): t is number => typeof t === 'number' && t > 0);

  const averageResponseTimeMs = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((acc, t) => acc + t, 0) / responseTimes.length)
    : 0;

  const minResponseTimeMs = responseTimes.length > 0 ? Math.min(...responseTimes) : 0;
  const maxResponseTimeMs = responseTimes.length > 0 ? Math.max(...responseTimes) : 0;

  const p50Ms = calculatePercentile(responseTimes, 50);
  const p95Ms = calculatePercentile(responseTimes, 95);
  const p99Ms = calculatePercentile(responseTimes, 99);

  return {
    uptimePercentage,
    totalChecks,
    successfulChecks,
    failedChecks,
    averageResponseTimeMs,
    minResponseTimeMs,
    maxResponseTimeMs,
    p50Ms,
    p95Ms,
    p99Ms,
  };
}

export async function recalculateProjectHealthScores(projectId: number) {
  try {
    // 1. Get 30d uptime stats
    const stats = await getProjectUptimeStats(projectId, 30);
    
    // Default fallback values if no monitoring data exists yet
    let uptimeScore = 100;
    let performanceScore = 100;

    if (stats.uptimePercentage !== null) {
      uptimeScore = Math.round(stats.uptimePercentage);
      
      const avgRt = stats.averageResponseTimeMs;
      if (avgRt <= 150) {
        performanceScore = 100;
      } else if (avgRt >= 1000) {
        performanceScore = 50;
      } else {
        // Linear scale down from 100 (at 150ms) to 50 (at 1000ms)
        performanceScore = Math.round(100 - ((avgRt - 150) / 850) * 50);
      }
    }

    // 2. Fetch project errors
    const errorsList = await db.select({ occurrences: projectErrors.occurrences })
      .from(projectErrors)
      .where(eq(projectErrors.projectId, projectId));

    const totalErrors = errorsList.reduce((acc, e) => acc + (e.occurrences || 1), 0);
    const errorScore = Math.max(0, 100 - totalErrors * 3);

    // Save recalculated scores back to the projects table
    await db.update(projects)
      .set({
        uptimeScore,
        performanceScore,
        errorScore,
        securityScore: null, // Keep explicit "Awaiting data" as per spec
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    console.log(`[HEALTH] Updated project ${projectId} health. Uptime: ${uptimeScore}%, Perf: ${performanceScore}%, ErrorScore: ${errorScore}`);
  } catch (err) {
    console.error('[HEALTH] Failed to recalculate project health scores:', err);
  }
}
