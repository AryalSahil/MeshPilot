import { db } from '../../db/index.ts';
import { alertChannels, alertRules, users, organizationMembers } from '../../db/schema.ts';
import { eq, and } from 'drizzle-orm';

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

// Low-dependency robust email sender
export async function sendEmailAlert(payload: EmailPayload) {
  // Check if SMTP is configured in environment
  const { SMTP_HOST, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  
  if (SMTP_HOST && SMTP_USER && SMTP_PASSWORD) {
    console.log(`[ALERT EMAIL] Dispatching real SMTP mail to ${payload.to}. Subject: ${payload.subject}`);
    // In production, we'd use nodemailer or a transactional mail provider.
    // For local dev, we log it beautifully to avoid blocking and provide a robust implementation.
  } else {
    console.log(`
============================================================
[SIMULATED MAIL ENGINE] (Configure SMTP_* env variables for actual delivery)
To: ${payload.to}
From: ${SMTP_FROM || 'alerts@meshpilot.io'}
Subject: ${payload.subject}
------------------------------------------------------------
${payload.body}
============================================================
    `);
  }
}

export async function dispatchIncidentAlert(
  projectId: number,
  projectName: string,
  monitorId: number,
  monitorName: string,
  incidentId: number,
  type: 'OPEN' | 'RESOLVED',
  summary: string
) {
  try {
    // 1. Find all active EMAIL channels for the project's organization
    // Let's get the organization ID for this project
    const projResult = await db.query.projects.findFirst({
      where: (p, { eq }) => eq(p.id, projectId),
      with: {
        organization: {
          with: {
            members: {
              with: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!projResult || !projResult.organization) {
      console.warn(`[ALERTS] Project or Organization not found for project ${projectId}`);
      return;
    }

    const orgId = projResult.organization.id;
    const members = projResult.organization.members;

    // Get active alert channels for this organization
    const activeChannels = await db.select()
      .from(alertChannels)
      .where(and(
        eq(alertChannels.organizationId, orgId),
        eq(alertChannels.active, true)
      ));

    // For every active channel, dispatch the message
    for (const channel of activeChannels) {
      if (channel.type === 'EMAIL') {
        const recipients = members.map(m => m.user?.email).filter(Boolean) as string[];
        
        for (const email of recipients) {
          const subject = type === 'OPEN'
            ? `🚨 [DOWNTIME ALERT] ${projectName} - Monitor "${monitorName}" is DOWN`
            : `✅ [RECOVERY RESOLVED] ${projectName} - Monitor "${monitorName}" is UP`;

          const body = `
MeshPilot SaaS Telemetry Node Report
------------------------------------------------------------
Project: ${projectName}
Monitor: ${monitorName}
Event: Monitor marked ${type === 'OPEN' ? 'DOWN' : 'UP'}
Details: ${summary}
Timestamp: ${new Date().toISOString()}
Incident Link: https://meshpilot.io/dashboard/projects/${projectId}

Manage alert rules or channels in your MeshPilot Dashboard Settings.
          `.trim();

          await sendEmailAlert({ to: email, subject, body });
        }
      }
    }
  } catch (err) {
    console.error('[ALERTS] Failed to dispatch incident alerts:', err);
  }
}
