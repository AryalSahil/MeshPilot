import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getUserByUid,
  getUserOrgs,
  checkOrgMembership,
  getOrgProjects,
  getProjectById,
  createProjectInDb,
  updateProjectInDb,
  getProjectErrorsFromDb,
  getProjectMetricsFromDb,
  getAdminPlatformMetrics,
  getAdminUsersList,
  getAdminUserDetail,
  getAdminOrganizationsList,
  updateAdminUserStatus,
  deleteUserFromDb,
  logAdminActionInDb,
  getAdminAuditLogsList
} from './src/db/queries.ts';

// Monitoring & DB imports
import { db } from './src/db/index.ts';
import { monitors, monitorChecks, incidents, alertChannels, alertRules, notifications, usageEvents } from './src/db/schema.ts';
import { processMonitorCheck } from './src/lib/monitoring/processMonitor.ts';
import { getProjectUptimeStats, recalculateProjectHealthScores } from './src/lib/monitoring/calculateHealth.ts';
import { validateProjectLimit, validateMonitorLimits } from './src/lib/monitoring/planLimits.ts';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// --- PUBLIC & HEALH PATHS ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// --- AUTHENTICATED USER ENDPOINTS ---

// Get current user and active organization
app.get('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const orgs = await getUserOrgs(user.id);
    res.json({ user, organizations: orgs });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Get user projects
app.get('/api/projects', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const orgs = await getUserOrgs(user.id);
    if (orgs.length === 0) {
      return res.json([]);
    }

    // Default to the first organization's projects
    const activeOrgId = orgs[0].id;
    const projectsList = await getOrgProjects(activeOrgId);
    res.json(projectsList);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch projects' });
  }
});

// Create project
app.post('/api/projects', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { name, websiteUrl, environment, organizationId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Determine org ID
    let targetOrgId = organizationId;
    const orgs = await getUserOrgs(user.id);
    if (orgs.length === 0) {
      return res.status(400).json({ error: 'User does not belong to any organization' });
    }

    if (!targetOrgId) {
      targetOrgId = orgs[0].id;
    } else {
      // Validate user belongs to organization
      const belongs = await checkOrgMembership(user.id, targetOrgId);
      if (!belongs) {
        return res.status(403).json({ error: 'Forbidden: You do not belong to this organization' });
      }
    }

    const newProject = await createProjectInDb(targetOrgId, name, websiteUrl || '', environment || 'PRODUCTION');
    res.status(201).json(newProject);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create project' });
  }
});

// Edit, pause, or archive project
app.put('/api/projects/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.id);
    if (isNaN(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    const project = await getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Validate membership
    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) {
      return res.status(403).json({ error: 'Forbidden: You do not have access to this project' });
    }

    const { name, websiteUrl, environment, status } = req.body;
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (websiteUrl !== undefined) updates.websiteUrl = websiteUrl;
    if (environment !== undefined) updates.environment = environment;
    if (status !== undefined) updates.status = status;

    const updated = await updateProjectInDb(projectId, updates);
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update project' });
  }
});

// Get project metrics (response time, requests, error rate)
app.get('/api/projects/:id/metrics', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.id);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Verify membership
    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const metrics = await getProjectMetricsFromDb(projectId);
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch metrics' });
  }
});

// Get project errors
app.get('/api/projects/:id/errors', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.id);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Verify membership
    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const errors = await getProjectErrorsFromDb(projectId);
    res.json(errors);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch project errors' });
  }
});

// --- REAL MONITORING ENDPOINTS ---

// List monitors for a project
app.get('/api/projects/:projectId/monitors', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden: Unauthorized access to project' });

    const list = await db.select().from(monitors).where(eq(monitors.projectId, projectId)).orderBy(desc(monitors.createdAt));
    
    // Calculate uptime for each monitor
    const listWithUptime = await Promise.all(list.map(async (mon) => {
      const checks = await db.select({ status: monitorChecks.status })
        .from(monitorChecks)
        .where(eq(monitorChecks.monitorId, mon.id));
      
      const total = checks.length;
      const successful = checks.filter(c => c.status === 'UP').length;
      const uptimePercentage = total > 0 ? (successful / total) * 100 : null;
      
      return {
        ...mon,
        uptimePercentage
      };
    }));

    res.json(listWithUptime);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch monitors' });
  }
});

// Add monitor to a project
app.post('/api/projects/:projectId/monitors', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden: Unauthorized access to project' });

    const { name, url, monitorType, method, intervalSeconds, timeoutMs, expectedStatusCode, active } = req.body;

    if (!name || !url || !monitorType) {
      return res.status(400).json({ error: 'Missing required parameters: name, url, and monitorType are required.' });
    }

    // URL validation
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL scheme or format. Please supply a valid HTTP/HTTPS address.' });
    }

    // Enforce valid protocols
    const mType = String(monitorType).toUpperCase();
    if (mType !== 'HTTP' && mType !== 'HTTPS') {
      return res.status(400).json({ error: 'Supported monitor types are HTTP and HTTPS.' });
    }

    // Interval validation
    const interval = parseInt(intervalSeconds) || 300;
    const allowedIntervals = [60, 300, 600, 900, 1800, 3600];
    if (!allowedIntervals.includes(interval)) {
      return res.status(400).json({ error: 'Invalid interval. Must be one of: 1 min, 5 min, 10 min, 15 min, 30 min, or 60 min.' });
    }

    // Timeout validation
    const timeout = parseInt(timeoutMs) || 10000;
    if (timeout <= 0 || timeout > 30000) {
      return res.status(400).json({ error: 'Timeout must be a positive number not exceeding 30,000ms.' });
    }

    // Expected HTTP status validation
    const expectedStatus = parseInt(expectedStatusCode) || 200;
    if (expectedStatus < 100 || expectedStatus > 599) {
      return res.status(400).json({ error: 'Expected HTTP Status must be a valid code between 100 and 599.' });
    }

    // ENFORCE PLAN LIMITS SERVER-SIDE
    try {
      await validateMonitorLimits(projectId, interval);
    } catch (limitErr: any) {
      return res.status(402).json({ error: 'PLAN_LIMIT_REACHED', message: limitErr.message });
    }

    // Insert monitor
    const inserted = await db.insert(monitors)
      .values({
        projectId,
        name,
        url,
        monitorType: mType,
        method: String(method || 'GET').toUpperCase(),
        intervalSeconds: interval,
        timeoutMs: timeout,
        expectedStatusCode: expectedStatus,
        active: active !== undefined ? Boolean(active) : true,
        lastStatus: 'UNKNOWN',
        consecutiveFailures: 0,
        nextCheckAt: new Date(),
      })
      .returning();

    const newMonitor = inserted[0];

    // Log admin action or general activity event
    await logAdminActionInDb(
      user.id,
      user.email,
      'CREATE_MONITOR',
      `Monitor "${name}" created for project ${project.name}`,
      req.ip
    );

    // Immediately execute the first health check synchronously before returning (if active)
    let checkReport = null;
    if (newMonitor.active) {
      checkReport = await processMonitorCheck(newMonitor.id);
    }

    // Retrieve fresh monitor record with updated status
    const freshMonitor = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, newMonitor.id),
    });

    res.status(201).json({ monitor: freshMonitor, initialCheck: checkReport });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create monitor' });
  }
});

// Get individual monitor detail
app.get('/api/monitors/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      } as any,
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden: Unauthorized monitor access' });

    res.json(monitorObj);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch monitor details' });
  }
});

// Edit / Update monitor
app.patch('/api/monitors/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      } as any,
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const { name, url, method, intervalSeconds, timeoutMs, expectedStatusCode, active } = req.body;
    const updates: any = {};

    if (name !== undefined) updates.name = name;
    
    if (url !== undefined) {
      try {
        new URL(url);
        updates.url = url;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }
    }

    if (method !== undefined) updates.method = String(method).toUpperCase();

    if (intervalSeconds !== undefined) {
      const interval = parseInt(intervalSeconds);
      const allowedIntervals = [60, 300, 600, 900, 1800, 3600];
      if (!allowedIntervals.includes(interval)) {
        return res.status(400).json({ error: 'Invalid check interval' });
      }
      updates.intervalSeconds = interval;
    }

    if (timeoutMs !== undefined) {
      const timeout = parseInt(timeoutMs);
      if (timeout <= 0 || timeout > 30000) {
        return res.status(400).json({ error: 'Timeout must be between 1 and 30,000ms' });
      }
      updates.timeoutMs = timeout;
    }

    if (expectedStatusCode !== undefined) {
      const expectedStatus = parseInt(expectedStatusCode);
      if (expectedStatus < 100 || expectedStatus > 599) {
        return res.status(400).json({ error: 'Expected status must be between 100 and 599' });
      }
      updates.expectedStatusCode = expectedStatus;
    }

    if (active !== undefined) {
      updates.active = Boolean(active);
      if (updates.active) {
        updates.nextCheckAt = new Date(); // Reset schedule to check immediately
      }
    }

    const updated = await db.update(monitors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(monitors.id, monitorId))
      .returning();

    await logAdminActionInDb(
      user.id,
      user.email,
      'EDIT_MONITOR',
      `Monitor "${monitorObj.name}" updated`,
      req.ip
    );

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update monitor' });
  }
});

// Delete monitor
app.delete('/api/monitors/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      } as any,
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    await db.delete(monitors).where(eq(monitors.id, monitorId));

    await logAdminActionInDb(
      user.id,
      user.email,
      'DELETE_MONITOR',
      `Monitor "${monitorObj.name}" permanently deleted`,
      req.ip
    );

    res.json({ success: true, message: 'Monitor deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete monitor' });
  }
});

// Trigger immediate manual health check ("Run Check Now")
app.post('/api/monitors/:id/check', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      } as any,
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    // Perform the real check
    const report = await processMonitorCheck(monitorId);
    
    // Retrieve fresh updated monitor info
    const freshMonitor = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
    });

    res.json({ monitor: freshMonitor, check: report });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to run manual check' });
  }
});

// Pause monitor
app.post('/api/monitors/:id/pause', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      } as any,
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    await db.update(monitors)
      .set({ active: false, updatedAt: new Date() })
      .where(eq(monitors.id, monitorId));

    res.json({ success: true, message: 'Monitor paused successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to pause monitor' });
  }
});

// Resume monitor
app.post('/api/monitors/:id/resume', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      } as any,
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    await db.update(monitors)
      .set({ active: true, nextCheckAt: new Date(), updatedAt: new Date() })
      .where(eq(monitors.id, monitorId));

    res.json({ success: true, message: 'Monitor resumed successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to resume monitor' });
  }
});

// Get paginated historical checks list
app.get('/api/monitors/:id/checks', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      } as any,
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    // Handle pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const list = await db.select()
      .from(monitorChecks)
      .where(eq(monitorChecks.monitorId, monitorId))
      .orderBy(desc(monitorChecks.checkedAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(monitorChecks)
      .where(eq(monitorChecks.monitorId, monitorId));

    const total = totalCountResult[0]?.count || 0;

    res.json({ checks: list, page, limit, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch historical checks' });
  }
});

// Get incidents list for a monitor
app.get('/api/monitors/:id/incidents', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      } as any,
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const list = await db.select()
      .from(incidents)
      .where(eq(incidents.monitorId, monitorId))
      .orderBy(desc(incidents.startedAt));

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch incidents' });
  }
});

// Get average performance aggregates over 24h, 7d, 30d, 90d
app.get('/api/monitors/:id/performance', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      } as any,
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const days = parseInt(req.query.days as string) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const checks = await db.select({
      responseTimeMs: monitorChecks.responseTimeMs,
      checkedAt: monitorChecks.checkedAt,
      status: monitorChecks.status,
    })
    .from(monitorChecks)
    .where(and(
      eq(monitorChecks.monitorId, monitorId),
      gte(monitorChecks.checkedAt, cutoffDate)
    ))
    .orderBy(desc(monitorChecks.checkedAt));

    const validRt = checks
      .map(c => c.responseTimeMs)
      .filter((t): t is number => typeof t === 'number' && t > 0);

    const total = validRt.length;
    const avg = total > 0 ? Math.round(validRt.reduce((acc, v) => acc + v, 0) / total) : 0;
    const min = total > 0 ? Math.min(...validRt) : 0;
    const max = total > 0 ? Math.max(...validRt) : 0;

    // Build historical series for chart plotting
    const chartSeries = checks.slice(0, 100).reverse(); // limit chart data payload to latest 100 entries

    res.json({
      average: avg,
      minimum: min,
      maximum: max,
      totalChecks: total,
      chartSeries,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to compile performance stats' });
  }
});

// Get overall project level uptime metrics
app.get('/api/projects/:projectId/uptime', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const days = parseInt(req.query.days as string) || 30;
    const stats = await getProjectUptimeStats(projectId, days);

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load project uptime metrics' });
  }
});

// Get performance history aggregated values for project charts
app.get('/api/projects/:projectId/performance', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const days = parseInt(req.query.days as string) || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Grab all project monitors to gather their historical performance
    const projMonitors = await db.select({ id: monitors.id }).from(monitors).where(eq(monitors.projectId, projectId));
    if (projMonitors.length === 0) {
      return res.json([]);
    }

    const monitorIds = projMonitors.map(m => m.id);

    // Fetch checks for these monitors
    const performanceChecks = await db.select({
      id: monitorChecks.id,
      checkedAt: monitorChecks.checkedAt,
      responseTimeMs: monitorChecks.responseTimeMs,
      status: monitorChecks.status,
    })
    .from(monitorChecks)
    .where(and(
      sql`monitor_id IN (${sql.join(monitorIds, sql`, `)})`,
      gte(monitorChecks.checkedAt, cutoffDate)
    ))
    .orderBy(desc(monitorChecks.checkedAt))
    .limit(100);

    res.json(performanceChecks.reverse());
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load performance metrics' });
  }
});

// Get unread notifications for a user
app.get('/api/notifications', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const list = await db.select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(100);

    const unreadCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(and(
        eq(notifications.userId, user.id),
        eq(notifications.read, false)
      ));

    const unreadCount = unreadCountResult[0]?.count || 0;

    res.json({ notifications: list, unreadCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to load notifications' });
  }
});

// Mark single notification read
app.post('/api/notifications/:id/read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const notifId = parseInt(req.params.id);
    await db.update(notifications)
      .set({ read: true })
      .where(and(
        eq(notifications.id, notifId),
        eq(notifications.userId, user.id)
      ));

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update notification' });
  }
});

// Mark all notifications read for user
app.post('/api/notifications/read-all', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    await db.update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, user.id));

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update notifications' });
  }
});


// --- SCHEDULER CRON SERVICE ENDPOINT ---

app.post('/api/cron/monitoring', async (req, res) => {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'meshpilot-cron-sec-123';
  
  // Secure authentication checking
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid cron secrets code' });
  }

  try {
    const now = new Date();
    
    // Find up to 15 active monitors that are currently due for execution (to prevent memory overflow)
    const dueMonitors = await db.select({ id: monitors.id })
      .from(monitors)
      .where(and(
        eq(monitors.active, true),
        lte(monitors.nextCheckAt, now)
      ))
      .limit(15);

    if (dueMonitors.length === 0) {
      return res.json({ message: 'Sync complete. No active monitors are due for checking.', processedCount: 0 });
    }

    const checkPromises = dueMonitors.map(async (m) => {
      // Temporarily bump nextCheckAt to now + 5 min during picking to prevent duplicate concurrent check races (locking)
      const lockDate = new Date(now.getTime() + 300 * 1000);
      await db.update(monitors).set({ nextCheckAt: lockDate }).where(eq(monitors.id, m.id));
      
      // Execute the check orchestrator
      return processMonitorCheck(m.id);
    });

    const executionSummary = await Promise.all(checkPromises);

    res.json({
      message: `Successfully executed check sequence on ${dueMonitors.length} monitor nodes.`,
      processedCount: dueMonitors.length,
      summary: executionSummary,
    });
  } catch (err: any) {
    console.error('[CRON] Scheduled loop failure:', err);
    res.status(500).json({ error: err.message || 'Monitoring scheduler loop failed.' });
  }
});


// --- ADMIN SECURE ENDPOINTS ---

// Admin route guard middleware
const requireAdmin = async (req: AuthRequest, res: any, next: any) => {
  const user = req.dbUser;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST'];
  if (!adminRoles.includes(user.role)) {
    return res.status(403).json({ error: 'Forbidden: Admin clearance required' });
  }
  next();
};

// Admin metrics overview
app.get('/api/admin/metrics', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const stats = await getAdminPlatformMetrics();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch admin stats' });
  }
});

// Admin list users with search/filter
app.get('/api/admin/users', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { search, status, role } = req.query;
    const usersList = await getAdminUsersList(search as string, status as string, role as string);
    res.json(usersList);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch users list' });
  }
});

// Admin view detailed user
app.get('/api/admin/users/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });

    const details = await getAdminUserDetail(userId);
    if (!details) return res.status(404).json({ error: 'User not found' });

    res.json(details);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch user details' });
  }
});

// Admin suspend user
app.post('/api/admin/users/:id/suspend', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updated = await updateAdminUserStatus(userId, 'SUSPENDED');
    if (!updated) return res.status(404).json({ error: 'User not found' });

    await logAdminActionInDb(
      req.dbUser!.id,
      req.dbUser!.email,
      'SUSPEND_USER',
      `User ${updated.email} (${userId}) suspended`,
      req.ip
    );

    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to suspend user' });
  }
});

// Admin reactivate user
app.post('/api/admin/users/:id/reactivate', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const updated = await updateAdminUserStatus(userId, 'ACTIVE');
    if (!updated) return res.status(404).json({ error: 'User not found' });

    await logAdminActionInDb(
      req.dbUser!.id,
      req.dbUser!.email,
      'REACTIVATE_USER',
      `User ${updated.email} (${userId}) reactivated`,
      req.ip
    );

    res.json({ success: true, user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reactivate user' });
  }
});

// Admin delete user
app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const deleted = await deleteUserFromDb(userId);
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    await logAdminActionInDb(
      req.dbUser!.id,
      req.dbUser!.email,
      'DELETE_USER',
      `User ${deleted.email} (${userId}) deleted`,
      req.ip
    );

    res.json({ success: true, user: deleted });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
});

// Admin list organizations
app.get('/api/admin/organizations', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const orgs = await getAdminOrganizationsList();
    res.json(orgs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch organizations list' });
  }
});

// Admin audit logs list
app.get('/api/admin/audit-logs', requireAuth, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const logs = await getAdminAuditLogsList();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch audit logs' });
  }
});


// --- INTEGRATE EXPRESS AND VITE ---

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// --- LOCAL BACKGROUND SCHEDULER LOOP ---
// Periodically checks if any active monitors are due for a health check and executes them
const runSchedulerLoop = async () => {
  try {
    const now = new Date();
    // Fetch up to 10 active monitors that are due for checking
    const dueMonitors = await db.select({ id: monitors.id })
      .from(monitors)
      .where(and(
        eq(monitors.active, true),
        lte(monitors.nextCheckAt, now)
      ))
      .limit(10);

    for (const m of dueMonitors) {
      // Locking mechanism: temporarily bump nextCheckAt to now + 5 min during processing to prevent concurrent check races
      const lockDate = new Date(now.getTime() + 300 * 1000);
      await db.update(monitors).set({ nextCheckAt: lockDate }).where(eq(monitors.id, m.id));
      
      // Execute the health check engine
      await processMonitorCheck(m.id);
    }
  } catch (err) {
    console.error('[SCHEDULER] Local loop background check error:', err);
  }
};

// Start the background check runner (every 15 seconds)
setInterval(runSchedulerLoop, 15000);
