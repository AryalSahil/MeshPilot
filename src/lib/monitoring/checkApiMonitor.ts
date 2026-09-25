import { db } from '../../db/index.ts';
import { apiMonitors, apiMonitorChecks, incidents, usageEvents, notifications, organizationMembers } from '../../db/schema.ts';
import { isSafeUrl } from './checkMonitor.ts';
import { recalculateProjectHealthScores } from './calculateHealth.ts';
import { dispatchIncidentAlert } from './alerts.ts';
import { eq, and, desc } from 'drizzle-orm';
import { adminDb } from '../firebase-admin.ts';

// Resolve secrets stored inside curly braces {{MY_SECRET}}
export function resolveSecrets(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
    return process.env[key] || '';
  });
}

// Simple JSON Path Selector
export function selectPath(obj: any, path: string): any {
  if (!path || !path.startsWith('$')) return undefined;
  const parts = path.substring(2).split('.').filter(Boolean);
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

export interface ApiCheckResult {
  status: 'UP' | 'DOWN' | 'TIMEOUT' | 'ERROR' | 'VALIDATION_FAILED';
  statusCode?: number;
  responseTimeMs: number;
  contentType?: string;
  validationStatus: 'PASSED' | 'FAILED';
  errorType?: string;
  errorMessage?: string;
}

export async function executeApiCheck(monitor: typeof apiMonitors.$inferSelect): Promise<ApiCheckResult> {
  const startTime = Date.now();
  
  // 1. SSRF Safety check
  const isSafe = await isSafeUrl(monitor.endpointUrl);
  if (!isSafe) {
    return {
      status: 'ERROR',
      responseTimeMs: Date.now() - startTime,
      validationStatus: 'FAILED',
      errorType: 'SSRF_PROTECTION_TRIGGERED',
      errorMessage: 'Unsafe destination or private IP addresses were blocked.'
    };
  }

  // Resolve headers and body secrets
  let headers: Record<string, string> = {
    'User-Agent': 'MeshPilot/1.0 EdgeApiMonitor',
    'Accept': '*/*'
  };

  if (monitor.requestHeaders) {
    try {
      const parsedHeaders = JSON.parse(monitor.requestHeaders);
      for (const [k, v] of Object.entries(parsedHeaders)) {
        headers[k] = resolveSecrets(String(v));
      }
    } catch (e) {
      // Ignore parse failure, use defaults
    }
  }

  let body: string | undefined = undefined;
  if (monitor.requestBody && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(monitor.method)) {
    body = resolveSecrets(monitor.requestBody);
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), monitor.timeoutMs || 10000);

  try {
    const fetchStart = Date.now();
    const res = await fetch(monitor.endpointUrl, {
      method: monitor.method,
      headers,
      body,
      redirect: 'manual', // Intercept manually to prevent redirects to private IP spaces
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - fetchStart;
    const contentType = res.headers.get('content-type') || 'text/plain';

    // Handle Redirect Safety
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (loc) {
        const absoluteUrl = new URL(loc, monitor.endpointUrl).toString();
        const hopSafe = await isSafeUrl(absoluteUrl);
        if (!hopSafe) {
          return {
            status: 'ERROR',
            statusCode: res.status,
            responseTimeMs,
            contentType,
            validationStatus: 'FAILED',
            errorType: 'SSRF_PROTECTION_TRIGGERED',
            errorMessage: 'SSRF validation failed on redirect hop.'
          };
        }
      }
    }

    // Parse limited response body for validations
    let responseText = '';
    let responseJson: any = null;

    try {
      const arrayBuffer = await res.arrayBuffer();
      // Only read first 10KB to avoid excessive memory usage
      const chunk = arrayBuffer.slice(0, 10240);
      responseText = new TextDecoder().decode(chunk);
      if (contentType.includes('application/json')) {
        responseJson = JSON.parse(responseText);
      }
    } catch (err) {
      // Ignore parse/read body errors
    }

    // 2. Validate expected HTTP Status
    if (res.status !== monitor.expectedStatusCode) {
      return {
        status: 'DOWN',
        statusCode: res.status,
        responseTimeMs,
        contentType,
        validationStatus: 'FAILED',
        errorType: 'HTTP_STATUS_MISMATCH',
        errorMessage: `Expected HTTP ${monitor.expectedStatusCode}, received HTTP ${res.status}`
      };
    }

    // 3. Validate expected Content Type
    if (monitor.expectedContentType && !contentType.toLowerCase().includes(monitor.expectedContentType.toLowerCase())) {
      return {
        status: 'VALIDATION_FAILED',
        statusCode: res.status,
        responseTimeMs,
        contentType,
        validationStatus: 'FAILED',
        errorType: 'CONTENT_TYPE_MISMATCH',
        errorMessage: `Expected content type "${monitor.expectedContentType}", received "${contentType}"`
      };
    }

    // 4. Validate response validation rules
    if (monitor.responseValidation) {
      try {
        const rules = JSON.parse(monitor.responseValidation);
        // Supports rule structure: { type: "json_path" | "contains_text", jsonPath: "$.status", operator: "equals" | "contains" | "exists", expectedValue: "ok" }
        if (rules && typeof rules === 'object') {
          if (rules.type === 'contains_text' && rules.expectedValue) {
            if (!responseText.includes(rules.expectedValue)) {
              return {
                status: 'VALIDATION_FAILED',
                statusCode: res.status,
                responseTimeMs,
                contentType,
                validationStatus: 'FAILED',
                errorType: 'VALIDATION_RULE_FAILED',
                errorMessage: `Response did not contain expected text "${rules.expectedValue}"`
              };
            }
          } else if (rules.type === 'json_path' && rules.jsonPath) {
            if (!responseJson) {
              return {
                status: 'VALIDATION_FAILED',
                statusCode: res.status,
                responseTimeMs,
                contentType,
                validationStatus: 'FAILED',
                errorType: 'INVALID_JSON_RESPONSE',
                errorMessage: 'Expected JSON response body to execute JSON path validations.'
              };
            }
            const actualVal = selectPath(responseJson, rules.jsonPath);
            if (rules.operator === 'exists') {
              if (actualVal === undefined || actualVal === null) {
                return {
                  status: 'VALIDATION_FAILED',
                  statusCode: res.status,
                  responseTimeMs,
                  contentType,
                  validationStatus: 'FAILED',
                  errorType: 'VALIDATION_RULE_FAILED',
                  errorMessage: `JSON Path "${rules.jsonPath}" does not exist.`
                };
              }
            } else if (rules.operator === 'equals') {
              if (String(actualVal) !== String(rules.expectedValue)) {
                return {
                  status: 'VALIDATION_FAILED',
                  statusCode: res.status,
                  responseTimeMs,
                  contentType,
                  validationStatus: 'FAILED',
                  errorType: 'VALIDATION_RULE_FAILED',
                  errorMessage: `JSON Path "${rules.jsonPath}" expected "${rules.expectedValue}", found "${actualVal}"`
                };
              }
            } else if (rules.operator === 'contains') {
              if (!String(actualVal).includes(String(rules.expectedValue))) {
                return {
                  status: 'VALIDATION_FAILED',
                  statusCode: res.status,
                  responseTimeMs,
                  contentType,
                  validationStatus: 'FAILED',
                  errorType: 'VALIDATION_RULE_FAILED',
                  errorMessage: `JSON Path "${rules.jsonPath}" value "${actualVal}" does not contain "${rules.expectedValue}"`
                };
              }
            }
          }
        }
      } catch (err) {
        return {
          status: 'VALIDATION_FAILED',
          statusCode: res.status,
          responseTimeMs,
          contentType,
          validationStatus: 'FAILED',
          errorType: 'VALIDATION_ENGINE_ERROR',
          errorMessage: 'Response validation configuration error.'
        };
      }
    }

    return {
      status: 'UP',
      statusCode: res.status,
      responseTimeMs,
      contentType,
      validationStatus: 'PASSED'
    };

  } catch (err: any) {
    clearTimeout(timeoutId);
    const responseTimeMs = Date.now() - startTime;

    if (err.name === 'AbortError') {
      return {
        status: 'TIMEOUT',
        responseTimeMs,
        validationStatus: 'FAILED',
        errorType: 'TIMEOUT_EXCEEDED',
        errorMessage: `API request exceeded timeout of ${monitor.timeoutMs}ms.`
      };
    }

    return {
      status: 'ERROR',
      responseTimeMs,
      validationStatus: 'FAILED',
      errorType: err.code || 'API_CONNECTION_FAILURE',
      errorMessage: err.message || 'DNS resolution or network handshake failed.'
    };
  }
}

// Orchestrator for API check processing
export async function processApiMonitorCheck(monitorId: number): Promise<any> {
  const checkTime = new Date();
  try {
    const monitor = await db.query.apiMonitors.findFirst({
      where: (m, { eq }) => eq(m.id, monitorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!monitor || !monitor.project) {
      return { success: false, reason: 'API Monitor or associated project not found' };
    }

    // Execute check
    const result = await executeApiCheck(monitor);

    // Write to postgres database
    const inserted = await db.insert(apiMonitorChecks)
      .values({
        apiMonitorId: monitor.id,
        status: result.status,
        statusCode: result.statusCode || null,
        responseTimeMs: result.responseTimeMs,
        contentType: result.contentType || null,
        validationStatus: result.validationStatus,
        errorType: result.errorType || null,
        errorMessage: result.errorMessage || null,
        checkedAt: checkTime
      })
      .returning();

    const pgCheckId = inserted[0].id;

    // Persist check telemetry in Firestore
    try {
      const fsCheckId = `api-check-${pgCheckId}-${Math.random().toString(36).substring(2, 7)}`;
      await adminDb.collection('api_monitor_checks').doc(fsCheckId).set({
        id: fsCheckId,
        apiMonitorId: String(monitorId),
        status: result.status,
        statusCode: result.statusCode || null,
        responseTimeMs: result.responseTimeMs,
        contentType: result.contentType || null,
        validationStatus: result.validationStatus,
        errorType: result.errorType || null,
        errorMessage: result.errorMessage || null,
        checkedAt: checkTime.toISOString()
      });

      await adminDb.collection('api_monitors').doc(String(monitorId)).set({
        id: String(monitorId),
        projectId: String(monitor.projectId),
        name: monitor.name,
        endpointUrl: monitor.endpointUrl,
        active: Boolean(monitor.active),
        lastStatus: result.status,
        lastResponseTimeMs: result.responseTimeMs,
        lastCheckedAt: checkTime.toISOString(),
        updatedAt: checkTime.toISOString()
      }, { merge: true });
    } catch (fsErr) {
      console.error('[CRON API] Firestore save failure:', fsErr);
    }

    // Update API monitor state
    const nextCheckDate = new Date(checkTime.getTime() + monitor.intervalSeconds * 1000);
    const isUp = result.status === 'UP';
    const newConsecutiveFailures = isUp ? 0 : monitor.consecutiveFailures + 1;

    await db.update(apiMonitors)
      .set({
        lastCheckedAt: checkTime,
        lastStatus: result.status,
        lastResponseTimeMs: result.responseTimeMs,
        consecutiveFailures: newConsecutiveFailures,
        nextCheckAt: nextCheckDate,
        updatedAt: checkTime
      })
      .where(eq(apiMonitors.id, monitor.id));

    // Incident State Transition Engine (3 consecutive failures -> incident opened; 2 successful checks -> incident resolved)
    if (!isUp) {
      if (newConsecutiveFailures >= 3) {
        // Look for open incident
        const openIncident = await db.query.incidents.findFirst({
          where: (i, { eq, and }) => and(
            eq(i.apiMonitorId, monitor.id),
            eq(i.status, 'OPEN')
          )
        });

        if (!openIncident) {
          const summary = `API Monitor "${monitor.name}" reported ${result.status}. Error: ${result.errorMessage || 'Validation failed'}`;
          const insertedIncident = await db.insert(incidents)
            .values({
              apiMonitorId: monitor.id,
              projectId: monitor.projectId,
              status: 'OPEN',
              failureCount: newConsecutiveFailures,
              summary
            })
            .returning();

          // Dispatch notifications
          const orgId = monitor.project.organizationId;
          if (orgId) {
            const members = await db.select().from(organizationMembers).where(eq(organizationMembers.organizationId, orgId));
            for (const member of members) {
              if (member.userId) {
                await db.insert(notifications)
                  .values({
                    userId: member.userId,
                    title: `API Service Incident: ${monitor.project.name}`,
                    category: 'Downtime',
                    description: `API Monitor "${monitor.name}" is DOWN. ${summary}`,
                    linkTo: `/dashboard/api-monitors/${monitor.id}`
                  });
              }
            }
          }

          // Dispatch email alert
          await dispatchIncidentAlert(
            monitor.projectId,
            monitor.project.name,
            monitor.id,
            monitor.name,
            insertedIncident[0].id,
            'OPEN',
            summary
          );
        } else {
          // Increment failure count
          await db.update(incidents)
            .set({
              failureCount: openIncident.failureCount + 1,
              updatedAt: new Date()
            })
            .where(eq(incidents.id, openIncident.id));
        }
      }
    } else {
      // It is UP! Check if there is an open incident
      const openIncident = await db.query.incidents.findFirst({
        where: (i, { eq, and }) => and(
          eq(i.apiMonitorId, monitor.id),
          eq(i.status, 'OPEN')
        )
      });

      if (openIncident) {
        const newRecoveryCount = openIncident.recoveryCount + 1;
        if (newRecoveryCount >= 2) {
          // Resolve incident
          await db.update(incidents)
            .set({
              status: 'RESOLVED',
              resolvedAt: new Date(),
              recoveryCount: newRecoveryCount,
              updatedAt: new Date()
            })
            .where(eq(incidents.id, openIncident.id));

          const summary = `API Monitor "${monitor.name}" has fully recovered after ${openIncident.failureCount} failed checks.`;
          
          const orgId = monitor.project.organizationId;
          if (orgId) {
            const members = await db.select().from(organizationMembers).where(eq(organizationMembers.organizationId, orgId));
            for (const member of members) {
              if (member.userId) {
                await db.insert(notifications)
                  .values({
                    userId: member.userId,
                    title: `API Service Recovered: ${monitor.project.name}`,
                    category: 'Deployments',
                    description: `API Monitor "${monitor.name}" is UP. ${summary}`,
                    linkTo: `/dashboard/api-monitors/${monitor.id}`
                  });
              }
            }
          }

          // Dispatch email alert
          await dispatchIncidentAlert(
            monitor.projectId,
            monitor.project.name,
            monitor.id,
            monitor.name,
            openIncident.id,
            'RESOLVED',
            summary
          );
        } else {
          await db.update(incidents)
            .set({
              recoveryCount: newRecoveryCount,
              updatedAt: new Date()
            })
            .where(eq(incidents.id, openIncident.id));
        }
      }
    }

    // Record usage event
    await db.insert(usageEvents)
      .values({
        organizationId: monitor.project.organizationId,
        projectId: monitor.projectId,
        eventType: 'MONITORING_CHECK',
        quantity: 1,
        timestamp: checkTime
      });

    // Recalculate project score
    await recalculateProjectHealthScores(monitor.projectId);

    return {
      success: true,
      checkId: pgCheckId,
      status: result.status,
      responseTimeMs: result.responseTimeMs
    };

  } catch (err: any) {
    console.error(`[PROCESSOR API] Check loop exception on monitor ${monitorId}:`, err);
    return { success: false, error: err.message };
  }
}
