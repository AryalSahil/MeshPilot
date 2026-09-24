import { db } from '../../db/index.ts';
import { incidents, monitors, projects, notifications, organizationMembers } from '../../db/schema.ts';
import { eq, and, desc } from 'drizzle-orm';
import { dispatchIncidentAlert } from './alerts.ts';

// Constants for threshold transitions
const FAILURE_THRESHOLD = 3;
const RECOVERY_THRESHOLD = 2;

export async function handleFailedCheck(
  monitorId: number,
  projectId: number,
  errorMessage: string,
  statusCode?: number
) {
  try {
    // 1. Fetch monitor & project info
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      }
    }) as any;

    if (!monitorObj) return;

    const newFailureCount = monitorObj.consecutiveFailures + 1;

    // Update consecutive failures on monitor
    await db.update(monitors)
      .set({
        consecutiveFailures: newFailureCount,
        lastStatus: 'DOWN',
        updatedAt: new Date(),
      })
      .where(eq(monitors.id, monitorId));

    // Check if failure threshold is reached (e.g. 3 consecutive failures)
    if (newFailureCount >= FAILURE_THRESHOLD) {
      // Find if there is an existing OPEN incident to prevent duplicates
      const openIncident = await db.query.incidents.findFirst({
        where: (i, { eq, and }) => and(
          eq(i.monitorId, monitorId),
          eq(i.status, 'OPEN')
        ),
      });

      if (!openIncident) {
        const summary = `Monitor "${monitorObj.name}" reported failures. Last recorded error: "${errorMessage}" ${statusCode ? `(HTTP ${statusCode})` : ''}`;
        
        // 1. Open new incident
        const inserted = await db.insert(incidents)
          .values({
            monitorId,
            projectId,
            status: 'OPEN',
            failureCount: newFailureCount,
            summary,
          })
          .returning();

        const newIncident = inserted[0];

        // 2. Trigger notifications for all users of the organization
        const orgId = monitorObj.project?.organizationId;
        if (orgId) {
          const members = await db.select()
            .from(organizationMembers)
            .where(eq(organizationMembers.organizationId, orgId));

          for (const member of members) {
            if (member.userId) {
              await db.insert(notifications)
                .values({
                  userId: member.userId,
                  title: `Downtime Incident: ${monitorObj.project?.name}`,
                  category: 'Downtime',
                  description: `Monitor "${monitorObj.name}" is DOWN. ${summary}`,
                  linkTo: `/dashboard/projects/${projectId}`,
                });
            }
          }
        }

        // 3. Dispatch Emails
        await dispatchIncidentAlert(
          projectId,
          monitorObj.project?.name || 'My Project',
          monitorId,
          monitorObj.name,
          newIncident.id,
          'OPEN',
          summary
        );

        console.log(`[INCIDENTS] Opened new incident ${newIncident.id} for monitor ${monitorId}`);
      } else {
        // Increment failure count in current open incident
        await db.update(incidents)
          .set({
            failureCount: openIncident.failureCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(incidents.id, openIncident.id));
      }
    }
  } catch (err) {
    console.error('[INCIDENTS] Failed to handle failed check:', err);
  }
}

export async function handleSuccessfulCheck(monitorId: number, projectId: number) {
  try {
    // 1. Fetch monitor & project info
    const monitorObj = await db.query.monitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true,
      }
    }) as any;

    if (!monitorObj) return;

    // Reset consecutive failures on monitor
    await db.update(monitors)
      .set({
        consecutiveFailures: 0,
        lastStatus: 'UP',
        updatedAt: new Date(),
      })
      .where(eq(monitors.id, monitorId));

    // Find any existing OPEN incident
    const openIncident = await db.query.incidents.findFirst({
      where: (i, { eq, and }) => and(
        eq(i.monitorId, monitorId),
        eq(i.status, 'OPEN')
      ),
    });

    if (openIncident) {
      const newRecoveryCount = openIncident.recoveryCount + 1;

      if (newRecoveryCount >= RECOVERY_THRESHOLD) {
        // Resolve the incident
        await db.update(incidents)
          .set({
            status: 'RESOLVED',
            resolvedAt: new Date(),
            recoveryCount: newRecoveryCount,
            updatedAt: new Date(),
          })
          .where(eq(incidents.id, openIncident.id));

        const summary = `Monitor "${monitorObj.name}" has recovered successfully after ${openIncident.failureCount} failed checks.`;

        // Create recovery notifications
        const orgId = monitorObj.project?.organizationId;
        if (orgId) {
          const members = await db.select()
            .from(organizationMembers)
            .where(eq(organizationMembers.organizationId, orgId));

          for (const member of members) {
            if (member.userId) {
              await db.insert(notifications)
                .values({
                  userId: member.userId,
                  title: `Resolved: ${monitorObj.project?.name}`,
                  category: 'Deployments', // Recovery belongs to success events
                  description: `Monitor "${monitorObj.name}" is back UP. ${summary}`,
                  linkTo: `/dashboard/projects/${projectId}`,
                });
            }
          }
        }

        // Dispatch Email Alerts
        await dispatchIncidentAlert(
          projectId,
          monitorObj.project?.name || 'My Project',
          monitorId,
          monitorObj.name,
          openIncident.id,
          'RESOLVED',
          summary
        );

        console.log(`[INCIDENTS] Resolved incident ${openIncident.id} for monitor ${monitorId}`);
      } else {
        // Increment recovery count
        await db.update(incidents)
          .set({
            recoveryCount: newRecoveryCount,
            updatedAt: new Date(),
          })
          .where(eq(incidents.id, openIncident.id));
      }
    }
  } catch (err) {
    console.error('[INCIDENTS] Failed to handle successful check:', err);
  }
}
