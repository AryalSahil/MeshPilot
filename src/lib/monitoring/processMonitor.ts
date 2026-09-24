import { db } from '../../db/index.ts';
import { monitors, monitorChecks, usageEvents } from '../../db/schema.ts';
import { checkMonitorUrl } from './checkMonitor.ts';
import { handleFailedCheck, handleSuccessfulCheck } from './incidents.ts';
import { recalculateProjectHealthScores } from './calculateHealth.ts';
import { eq } from 'drizzle-orm';
import { adminDb } from '../firebase-admin.ts';

export async function processMonitorCheck(monitorId: number): Promise<any> {
  const checkTime = new Date();
  
  try {
    // 1. Fetch monitor detail
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      }
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      console.warn(`[PROCESSOR] Monitor ${monitorId} or associated project not found.`);
      return { success: false, reason: 'Monitor or project not found' };
    }

    // 2. Perform real URL checking
    const result = await checkMonitorUrl(
      monitorObj.url,
      monitorObj.method as 'GET' | 'HEAD',
      monitorObj.timeoutMs,
      monitorObj.expectedStatusCode
    );

    // 3. Save to monitor_checks table
    const checkResult = await db.insert(monitorChecks)
      .values({
        monitorId,
        status: result.status,
        statusCode: result.statusCode || null,
        responseTimeMs: result.responseTimeMs,
        errorType: result.errorType || null,
        errorMessage: result.errorMessage || null,
        checkedAt: checkTime,
      })
      .returning();

    const monitorCheckId = checkResult[0].id;

    // Save to Firestore too!
    try {
      const docId = `check-${monitorCheckId || Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      await adminDb.collection('monitor_checks').doc(docId).set({
        id: docId,
        monitorId: String(monitorId),
        status: result.status,
        statusCode: result.statusCode || null,
        responseTimeMs: result.responseTimeMs,
        errorType: result.errorType || null,
        errorMessage: result.errorMessage || null,
        checkedAt: checkTime.toISOString()
      });

      // Update monitor doc in Firestore
      await adminDb.collection('monitors').doc(String(monitorId)).set({
        id: String(monitorId),
        projectId: String(monitorObj.projectId),
        name: monitorObj.name,
        url: monitorObj.url,
        active: Boolean(monitorObj.active),
        lastStatus: result.status === 'UP' ? 'UP' : 'DOWN',
        lastResponseTimeMs: result.responseTimeMs,
        lastCheckedAt: checkTime.toISOString(),
        createdAt: monitorObj.createdAt ? new Date(monitorObj.createdAt).toISOString() : checkTime.toISOString(),
        updatedAt: checkTime.toISOString()
      }, { merge: true });
    } catch (fsErr) {
      console.error('[PROCESSOR] Error persisting monitoring telemetry to Firestore:', fsErr);
    }

    // 4. Update monitor stats (last status, response time, last checked at)

    const nextCheckDate = new Date(checkTime.getTime() + monitorObj.intervalSeconds * 1000);
    
    await db.update(monitors)
      .set({
        lastCheckedAt: checkTime,
        lastStatus: result.status === 'UP' ? 'UP' : 'DOWN',
        lastResponseTimeMs: result.responseTimeMs,
        nextCheckAt: nextCheckDate,
        updatedAt: checkTime,
      })
      .where(eq(monitors.id, monitorId));

    // 5. Trigger incident state machine transitions
    if (result.status === 'UP') {
      await handleSuccessfulCheck(monitorId, monitorObj.projectId);
    } else {
      await handleFailedCheck(
        monitorId,
        monitorObj.projectId,
        result.errorMessage || 'Connection failed',
        result.statusCode
      );
    }

    // 6. Record usage metrics
    await db.insert(usageEvents)
      .values({
        organizationId: monitorObj.project.organizationId || 0,
        projectId: monitorObj.projectId,
        monitorId: monitorId,
        eventType: 'MONITORING_CHECK',
        quantity: 1,
        timestamp: checkTime,
      });

    // 7. Recalculate project health scores asynchronously
    await recalculateProjectHealthScores(monitorObj.projectId);

    return {
      success: true,
      checkId: monitorCheckId,
      status: result.status,
      responseTimeMs: result.responseTimeMs,
    };
  } catch (err: any) {
    console.error(`[PROCESSOR] Failed to process monitor ${monitorId}:`, err);
    return { success: false, error: err.message };
  }
}
