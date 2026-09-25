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
import {
  projects,
  monitors,
  monitorChecks,
  incidents,
  alertChannels,
  alertRules,
  notifications,
  usageEvents,
  apiMonitors,
  apiMonitorChecks,
  errors,
  errorEvents,
  projectIngestionKeys,
  releases
} from './src/db/schema.ts';
import { processMonitorCheck } from './src/lib/monitoring/processMonitor.ts';
import { processApiMonitorCheck } from './src/lib/monitoring/checkApiMonitor.ts';
import {
  calculateFingerprint,
  sanitizeSensitiveData,
  parseUserAgent,
  hashKey,
  generateRawKey
} from './src/lib/monitoring/errorTracking.ts';
import crypto from 'crypto';
import { getProjectUptimeStats, recalculateProjectHealthScores } from './src/lib/monitoring/calculateHealth.ts';
import { validateProjectLimit, validateMonitorLimits } from './src/lib/monitoring/planLimits.ts';
import { eq, and, desc, gte, lte, sql, like } from 'drizzle-orm';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// --- PUBLIC & HEALH PATHS ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Create seed admin user in Clerk
import { createClerkClient } from '@clerk/backend';
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

app.post('/api/admin/create-seed-user', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const seedAdmins = [
      { email: 'sahilstarboyy@gmail.com', name: 'Sahil', role: 'SUPER_ADMIN', password: 'sahil2007&' },
      { email: 'superadmin@meshpilot.com', name: 'Sarah Connor', role: 'SUPER_ADMIN', password: 'admin123' },
      { email: 'admin@meshpilot.com', name: 'John Doe', role: 'ADMIN', password: 'admin123' },
      { email: 'support@meshpilot.com', name: 'Marcus Wright', role: 'SUPPORT', password: 'admin123' },
      { email: 'analyst@meshpilot.com', name: 'Kyle Reese', role: 'ANALYST', password: 'admin123' }
    ];

    const matchedSeed = seedAdmins.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
    if (!matchedSeed || password !== matchedSeed.password) {
      return res.status(403).json({ error: 'Invalid seed admin credentials' });
    }

    // Check if user already exists in Clerk
    const usersList = await clerkClient.users.getUserList({ emailAddress: [email] });
    if (usersList.data.length > 0) {
      return res.json({ success: true, message: 'User already exists in Clerk', userId: usersList.data[0].id });
    }

    // Create the seed admin user in Clerk
    const firstName = matchedSeed.name.split(' ')[0];
    const lastName = matchedSeed.name.split(' ')[1] || '';
    const newUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password: password,
      firstName,
      lastName,
      skipPasswordRequirement: false,
    });

    return res.status(201).json({ success: true, message: 'User created in Clerk', userId: newUser.id });
  } catch (err: any) {
    console.error('Error creating seed admin in Clerk:', err);
    return res.status(500).json({ error: err.message || 'Failed to create seed admin in Clerk' });
  }
});

// Secure error ingestion API
app.post('/api/errors/ingest', async (req, res) => {
  try {
    const rawPayload = req.body;
    const projectKey = rawPayload.projectKey || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    
    if (!projectKey) {
      return res.status(401).json({ error: 'Missing secure projectKey ingestion parameter' });
    }

    const keyHashed = hashKey(projectKey);

    // Verify key in PG
    const ingestionKey = await db.query.projectIngestionKeys.findFirst({
      where: and(
        eq(projectIngestionKeys.keyHash, keyHashed),
        sql`revoked_at IS NULL`
      )
    });

    if (!ingestionKey) {
      return res.status(401).json({ error: 'Invalid or revoked project ingestion key' });
    }

    const {
      environment = 'production',
      message,
      exceptionType = 'Error',
      stackTrace,
      url,
      endpoint,
      method = 'GET',
      statusCode,
      release,
      timestamp,
      userIdentifier
    } = rawPayload;

    if (!message) {
      return res.status(400).json({ error: 'Message parameter is required for error tracking' });
    }

    // Lookup project to find organizationId
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, ingestionKey.projectId)
    });

    if (!project) {
      return res.status(404).json({ error: 'Associated project not found' });
    }

    // Sanitize message & trace
    const cleanMessage = sanitizeSensitiveData(message);
    const cleanStackTrace = stackTrace ? sanitizeSensitiveData(stackTrace) : null;
    const cleanUrl = url ? sanitizeSensitiveData(url) : null;
    const cleanEndpoint = endpoint ? sanitizeSensitiveData(endpoint) : null;

    // Deterministic fingerprinting
    const fingerprint = calculateFingerprint({
      exceptionType,
      message: cleanMessage,
      stackTrace: cleanStackTrace || undefined,
      endpoint: cleanEndpoint || undefined
    });

    const now = new Date();
    const occurredAtDate = timestamp ? new Date(timestamp) : now;

    // Parse user agent
    const userAgentStr = req.headers['user-agent'] || '';
    const { browser, os, device } = parseUserAgent(userAgentStr);

    // Securely hash userIdentifier to protect PII
    const userIdentifierHash = userIdentifier 
      ? crypto.createHash('sha256').update(String(userIdentifier)).digest('hex')
      : null;

    // Check if error already exists under this fingerprint and project
    let errorRecord = await db.query.errors.findFirst({
      where: and(
        eq(errors.projectId, project.id),
        eq(errors.fingerprint, fingerprint)
      )
    });

    if (errorRecord) {
      // Check if user is newly affected
      let newlyAffected = 0;
      if (userIdentifierHash) {
        const previousEvent = await db.query.errorEvents.findFirst({
          where: and(
            eq(errorEvents.errorId, errorRecord.id),
            eq(errorEvents.userIdentifierHash, userIdentifierHash)
          )
        });
        if (!previousEvent) {
          newlyAffected = 1;
        }
      }

      // Update existing error
      const updatedList = await db.update(errors)
        .set({
          lastSeenAt: now,
          occurrenceCount: errorRecord.occurrenceCount + 1,
          affectedUsersCount: errorRecord.affectedUsersCount + newlyAffected,
          message: cleanMessage, // update message in case of minor variations
          status: errorRecord.status === 'RESOLVED' ? 'OPEN' : errorRecord.status, // reopen resolved if it occurs again
          updatedAt: now
        })
        .where(eq(errors.id, errorRecord.id))
        .returning();
      
      errorRecord = updatedList[0];
    } else {
      // Create new error group
      const insertedList = await db.insert(errors)
        .values({
          projectId: project.id,
          organizationId: project.organizationId!,
          environment: environment.toUpperCase(),
          fingerprint,
          message: cleanMessage,
          exceptionType,
          stackTrace: cleanStackTrace,
          severity: 'ERROR',
          source: (cleanUrl || cleanEndpoint) ? 'BROWSER' : 'SERVER',
          firstSeenAt: occurredAtDate,
          lastSeenAt: occurredAtDate,
          occurrenceCount: 1,
          affectedUsersCount: userIdentifier ? 1 : 0,
          status: 'OPEN'
        })
        .returning();

      errorRecord = insertedList[0];
    }

    // Insert structured event
    await db.insert(errorEvents)
      .values({
        errorId: errorRecord.id,
        projectId: project.id,
        organizationId: project.organizationId!,
        environment: environment.toUpperCase(),
        message: cleanMessage,
        stackTrace: cleanStackTrace,
        exceptionType,
        userIdentifierHash,
        url: cleanUrl,
        endpoint: cleanEndpoint,
        httpMethod: method.toUpperCase(),
        httpStatus: statusCode || null,
        browser,
        operatingSystem: os,
        device,
        release: release || null,
        metadata: JSON.stringify(sanitizeSensitiveData({
          ip: req.ip,
          headers: {
            host: req.headers.host,
            accept: req.headers.accept
          }
        })),
        occurredAt: occurredAtDate
      });

    // Update lastUsedAt on ingestion key
    await db.update(projectIngestionKeys)
      .set({ lastUsedAt: now })
      .where(eq(projectIngestionKeys.id, ingestionKey.id));

    res.status(201).json({
      success: true,
      errorId: errorRecord.id,
      fingerprint,
      status: errorRecord.status
    });

  } catch (err: any) {
    console.error('[INGEST_ERROR] API Exception:', err);
    res.status(500).json({ error: err.message || 'Internal error during ingestion processing' });
  }
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

// Get project errors (Filtered, Paginated)
app.get('/api/projects/:id/errors', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.id);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const { environment, severity, status, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    let conditions: any[] = [eq(errors.projectId, projectId)];
    if (environment) conditions.push(eq(errors.environment, String(environment).toUpperCase()));
    if (severity) conditions.push(eq(errors.severity, String(severity).toUpperCase()));
    if (status) conditions.push(eq(errors.status, String(status).toUpperCase()));
    if (search) conditions.push(like(errors.message, `%${search}%`));

    const errorsList = await db.select()
      .from(errors)
      .where(and(...conditions))
      .orderBy(desc(errors.lastSeenAt))
      .limit(limitNum)
      .offset(offset);

    const totalCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(errors)
      .where(and(...conditions));

    const total = totalCountResult[0]?.count || 0;

    res.json({ errors: errorsList, page: pageNum, limit: limitNum, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch project errors' });
  }
});

// Get individual error details
app.get('/api/errors/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const errorId = parseInt(req.params.id);
    const errorRecord = await db.query.errors.findFirst({
      where: eq(errors.id, errorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!errorRecord || !errorRecord.project) {
      return res.status(404).json({ error: 'Error not found' });
    }

    const belongs = await checkOrgMembership(user.id, errorRecord.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    res.json(errorRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch error details' });
  }
});

// Update error status or assignment
app.patch('/api/errors/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const errorId = parseInt(req.params.id);
    const errorRecord = await db.query.errors.findFirst({
      where: eq(errors.id, errorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!errorRecord || !errorRecord.project) {
      return res.status(404).json({ error: 'Error not found' });
    }

    const belongs = await checkOrgMembership(user.id, errorRecord.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const { status, assignedTo } = req.body;
    const updates: any = {};
    if (status !== undefined) {
      const allowedStatus = ['OPEN', 'RESOLVED', 'IGNORED'];
      if (!allowedStatus.includes(String(status).toUpperCase())) {
        return res.status(400).json({ error: 'Invalid status parameter' });
      }
      updates.status = String(status).toUpperCase();
    }
    if (assignedTo !== undefined) {
      updates.assignedTo = assignedTo ? parseInt(assignedTo) : null;
    }

    updates.updatedAt = new Date();

    const updated = await db.update(errors)
      .set(updates)
      .where(eq(errors.id, errorId))
      .returning();

    await logAdminActionInDb(
      user.id,
      user.email,
      'UPDATE_ERROR_STATE',
      `Error group #${errorId} was updated to status "${updates.status || errorRecord.status}"`,
      req.ip
    );

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update error' });
  }
});

// Get individual error events timeline with pagination
app.get('/api/errors/:id/events', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const errorId = parseInt(req.params.id);
    const errorRecord = await db.query.errors.findFirst({
      where: eq(errors.id, errorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!errorRecord || !errorRecord.project) {
      return res.status(404).json({ error: 'Error not found' });
    }

    const belongs = await checkOrgMembership(user.id, errorRecord.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const eventsList = await db.select()
      .from(errorEvents)
      .where(eq(errorEvents.errorId, errorId))
      .orderBy(desc(errorEvents.occurredAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(errorEvents)
      .where(eq(errorEvents.errorId, errorId));

    const total = totalCountResult[0]?.count || 0;

    res.json({ events: eventsList, page, limit, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch error events' });
  }
});

// Get project error rates over time
app.get('/api/projects/:projectId/error-rate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const { days = '30' } = req.query;
    const daysNum = parseInt(days as string) || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysNum);

    const events = await db.select({
      day: sql<string>`date_trunc('day', occurred_at)::text`,
      count: sql<number>`count(*)::int`
    })
    .from(errorEvents)
    .where(and(
      eq(errorEvents.projectId, projectId),
      gte(errorEvents.occurredAt, cutoff)
    ))
    .groupBy(sql`date_trunc('day', occurred_at)`)
    .orderBy(sql`date_trunc('day', occurred_at)`);

    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to compile error rate data' });
  }
});

// Get project ingestion keys
app.get('/api/projects/:projectId/ingestion-keys', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const list = await db.select({
      id: projectIngestionKeys.id,
      name: projectIngestionKeys.name,
      createdAt: projectIngestionKeys.createdAt,
      lastUsedAt: projectIngestionKeys.lastUsedAt,
      revokedAt: projectIngestionKeys.revokedAt
    })
    .from(projectIngestionKeys)
    .where(eq(projectIngestionKeys.projectId, projectId))
    .orderBy(desc(projectIngestionKeys.createdAt));

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch project ingestion keys' });
  }
});

// Create secure project ingestion key
app.post('/api/projects/:projectId/ingestion-keys', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Key name is required' });

    const rawKey = generateRawKey();
    const keyHashed = hashKey(rawKey);

    const inserted = await db.insert(projectIngestionKeys)
      .values({
        projectId,
        name,
        keyHash: keyHashed
      })
      .returning();

    await logAdminActionInDb(
      user.id,
      user.email,
      'CREATE_INGESTION_KEY',
      `Created key "${name}" for project ${project.name}`,
      req.ip
    );

    res.status(201).json({
      id: inserted[0].id,
      name: inserted[0].name,
      createdAt: inserted[0].createdAt,
      rawKey // returned ONLY ONCE upon creation
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate ingestion key' });
  }
});

// Revoke ingestion key
app.post('/api/ingestion-keys/:id/revoke', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const keyId = parseInt(req.params.id);
    const keyRecord = await db.query.projectIngestionKeys.findFirst({
      where: eq(projectIngestionKeys.id, keyId),
      with: {
        project: true
      } as any
    }) as any;

    if (!keyRecord || !keyRecord.project) {
      return res.status(404).json({ error: 'Ingestion key not found' });
    }

    const belongs = await checkOrgMembership(user.id, keyRecord.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const updated = await db.update(projectIngestionKeys)
      .set({ revokedAt: new Date() })
      .where(eq(projectIngestionKeys.id, keyId))
      .returning();

    await logAdminActionInDb(
      user.id,
      user.email,
      'REVOKE_INGESTION_KEY',
      `Revoked key "${keyRecord.name}" for project ${keyRecord.project.name}`,
      req.ip
    );

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to revoke ingestion key' });
  }
});

// List releases
app.get('/api/projects/:projectId/releases', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const list = await db.select()
      .from(releases)
      .where(eq(releases.projectId, projectId))
      .orderBy(desc(releases.deployedAt));

    const richList = await Promise.all(list.map(async (rel) => {
      const errorCountResult = await db.select({ count: sql<number>`count(*)::int` })
        .from(errorEvents)
        .where(and(
          eq(errorEvents.projectId, projectId),
          eq(errorEvents.release, rel.version)
        ));

      return {
        ...rel,
        errorCount: errorCountResult[0]?.count || 0
      };
    }));

    res.json(richList);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch releases' });
  }
});

// Create release
app.post('/api/projects/:projectId/releases', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const { version, environment, commitSha, deploymentId } = req.body;
    if (!version) return res.status(400).json({ error: 'Version is required' });

    const inserted = await db.insert(releases)
      .values({
        projectId,
        version,
        environment: environment || 'PRODUCTION',
        commitSha,
        deploymentId,
        deployedAt: new Date()
      })
      .returning();

    res.status(201).json(inserted[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to register release' });
  }
});

// --- REAL API MONITORING ENDPOINTS ---

// List API Monitors for a project
app.get('/api/projects/:projectId/api-monitors', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const list = await db.select().from(apiMonitors).where(eq(apiMonitors.projectId, projectId)).orderBy(desc(apiMonitors.createdAt));
    
    // Add uptime calculations
    const listWithStats = await Promise.all(list.map(async (mon) => {
      const checks = await db.select({ status: apiMonitorChecks.status })
        .from(apiMonitorChecks)
        .where(eq(apiMonitorChecks.apiMonitorId, mon.id));
      
      const total = checks.length;
      const successful = checks.filter(c => c.status === 'UP').length;
      const uptimePercentage = total > 0 ? (successful / total) * 100 : null;
      
      return {
        ...mon,
        uptimePercentage
      };
    }));

    res.json(listWithStats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch API monitors' });
  }
});

// Add API Monitor
app.post('/api/projects/:projectId/api-monitors', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projectId = parseInt(req.params.projectId);
    const project = await getProjectById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const belongs = await checkOrgMembership(user.id, project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const {
      name,
      endpointUrl,
      method,
      intervalSeconds,
      timeoutMs,
      expectedStatusCode,
      expectedContentType,
      requestHeaders,
      requestBody,
      responseValidation,
      active
    } = req.body;

    if (!name || !endpointUrl) {
      return res.status(400).json({ error: 'Name and Endpoint URL are required' });
    }

    try {
      new URL(endpointUrl);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL schema format.' });
    }

    // Insert monitor
    const inserted = await db.insert(apiMonitors)
      .values({
        projectId,
        name,
        endpointUrl,
        method: String(method || 'GET').toUpperCase(),
        intervalSeconds: parseInt(intervalSeconds) || 300,
        timeoutMs: parseInt(timeoutMs) || 10000,
        expectedStatusCode: parseInt(expectedStatusCode) || 200,
        expectedContentType: expectedContentType || null,
        requestHeaders: requestHeaders ? JSON.stringify(requestHeaders) : null,
        requestBody: requestBody || null,
        responseValidation: responseValidation ? JSON.stringify(responseValidation) : null,
        active: active !== undefined ? Boolean(active) : true
      })
      .returning();

    const newMonitor = inserted[0];

    await logAdminActionInDb(
      user.id,
      user.email,
      'CREATE_API_MONITOR',
      `API Monitor "${name}" created for project ${project.name}`,
      req.ip
    );

    // Synchronously run the first API check right away!
    if (newMonitor.active) {
      await processApiMonitorCheck(newMonitor.id);
    }

    const fresh = await db.query.apiMonitors.findFirst({
      where: eq(apiMonitors.id, newMonitor.id)
    });

    res.status(201).json(fresh);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create API monitor' });
  }
});

// Get individual API monitor details
app.get('/api/api-monitors/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.apiMonitors.findFirst({
      where: eq(apiMonitors.id, monitorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'API Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    // Scrub secret header references before returning to client!
    const sanitized = { ...monitorObj };
    if (sanitized.requestHeaders) {
      try {
        const headers = JSON.parse(sanitized.requestHeaders);
        const scrubbed: Record<string, string> = {};
        for (const [k, v] of Object.entries(headers)) {
          if (String(v).includes('{{') && String(v).includes('}}')) {
            scrubbed[k] = '•••••••• (Secret Reference)';
          } else {
            scrubbed[k] = String(v);
          }
        }
        sanitized.requestHeaders = JSON.stringify(scrubbed);
      } catch (e) {
        // ignore
      }
    }
    if (sanitized.requestBody && (sanitized.requestBody.includes('{{') && sanitized.requestBody.includes('}}'))) {
      sanitized.requestBody = '•••••••• (Contains Secret References)';
    }

    res.json(sanitized);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch API monitor' });
  }
});

// Update API Monitor
app.patch('/api/api-monitors/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.apiMonitors.findFirst({
      where: eq(apiMonitors.id, monitorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'API Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const {
      name,
      endpointUrl,
      method,
      intervalSeconds,
      timeoutMs,
      expectedStatusCode,
      expectedContentType,
      requestHeaders,
      requestBody,
      responseValidation,
      active
    } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (endpointUrl !== undefined) {
      try {
        new URL(endpointUrl);
        updates.endpointUrl = endpointUrl;
      } catch (e) {
        return res.status(400).json({ error: 'Invalid URL schema format' });
      }
    }
    if (method !== undefined) updates.method = String(method).toUpperCase();
    if (intervalSeconds !== undefined) updates.intervalSeconds = parseInt(intervalSeconds);
    if (timeoutMs !== undefined) updates.timeoutMs = parseInt(timeoutMs);
    if (expectedStatusCode !== undefined) updates.expectedStatusCode = parseInt(expectedStatusCode);
    if (expectedContentType !== undefined) updates.expectedContentType = expectedContentType || null;
    if (requestHeaders !== undefined) updates.requestHeaders = requestHeaders ? JSON.stringify(requestHeaders) : null;
    if (requestBody !== undefined) updates.requestBody = requestBody || null;
    if (responseValidation !== undefined) updates.responseValidation = responseValidation ? JSON.stringify(responseValidation) : null;
    if (active !== undefined) updates.active = Boolean(active);

    updates.updatedAt = new Date();

    const updated = await db.update(apiMonitors)
      .set(updates)
      .where(eq(apiMonitors.id, monitorId))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update API monitor' });
  }
});

// Delete API Monitor
app.delete('/api/api-monitors/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.apiMonitors.findFirst({
      where: eq(apiMonitors.id, monitorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'API Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    await db.delete(apiMonitors).where(eq(apiMonitors.id, monitorId));

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete API monitor' });
  }
});

// Run API Check manual trigger
app.post('/api/api-monitors/:id/check', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.apiMonitors.findFirst({
      where: eq(apiMonitors.id, monitorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'API Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const result = await processApiMonitorCheck(monitorId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to execute manual API check' });
  }
});

// Get historical checks for an API Monitor
app.get('/api/api-monitors/:id/checks', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.apiMonitors.findFirst({
      where: eq(apiMonitors.id, monitorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'API Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const list = await db.select()
      .from(apiMonitorChecks)
      .where(eq(apiMonitorChecks.apiMonitorId, monitorId))
      .orderBy(desc(apiMonitorChecks.checkedAt))
      .limit(limit)
      .offset(offset);

    const totalCountResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(apiMonitorChecks)
      .where(eq(apiMonitorChecks.apiMonitorId, monitorId));

    res.json({ checks: list, page, limit, total: totalCountResult[0]?.count || 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch checks' });
  }
});

// Get incidents list for an API monitor
app.get('/api/api-monitors/:id/incidents', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.apiMonitors.findFirst({
      where: eq(apiMonitors.id, monitorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'API Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const list = await db.select()
      .from(incidents)
      .where(eq(incidents.apiMonitorId, monitorId))
      .orderBy(desc(incidents.startedAt));

    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch incidents' });
  }
});

// Get performance latency aggregates and series
app.get('/api/api-monitors/:id/performance', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const monitorId = parseInt(req.params.id);
    const monitorObj = await db.query.apiMonitors.findFirst({
      where: eq(apiMonitors.id, monitorId),
      with: {
        project: true
      } as any
    }) as any;

    if (!monitorObj || !monitorObj.project) {
      return res.status(404).json({ error: 'API Monitor not found' });
    }

    const belongs = await checkOrgMembership(user.id, monitorObj.project.organizationId || 0);
    if (!belongs) return res.status(403).json({ error: 'Forbidden' });

    const days = parseInt(req.query.days as string) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const checks = await db.select({
      responseTimeMs: apiMonitorChecks.responseTimeMs,
      checkedAt: apiMonitorChecks.checkedAt,
      status: apiMonitorChecks.status
    })
    .from(apiMonitorChecks)
    .where(and(
      eq(apiMonitorChecks.apiMonitorId, monitorId),
      gte(apiMonitorChecks.checkedAt, cutoffDate)
    ))
    .orderBy(desc(apiMonitorChecks.checkedAt));

    const latencies = checks
      .map(c => c.responseTimeMs)
      .filter((t): t is number => typeof t === 'number' && t > 0)
      .sort((a, b) => a - b);

    const total = latencies.length;
    const avg = total > 0 ? Math.round(latencies.reduce((acc, v) => acc + v, 0) / total) : 0;
    const min = total > 0 ? latencies[0] : 0;
    const max = total > 0 ? latencies[total - 1] : 0;

    // Percentiles (p50, p95, p99)
    const percentile = (p: number) => {
      if (total === 0) return 0;
      const index = Math.ceil((p / 100) * total) - 1;
      return latencies[Math.max(0, index)];
    };

    res.json({
      average: avg,
      minimum: min,
      maximum: max,
      p50: percentile(50),
      p95: percentile(95),
      p99: percentile(99),
      totalChecks: total,
      chartSeries: checks.slice(0, 100).reverse()
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch performance telemetry' });
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
  try {
    const user = req.dbUser;
    const decodedToken = req.user; // attached in requireAuth

    if (!user || !decodedToken) {
      return res.status(401).json({ error: 'Unauthorized: Session missing' });
    }

    // Securely check Clerk session metadata
    const clerkUserId = decodedToken.sub;
    let role = decodedToken.publicMetadata?.role || decodedToken.metadata?.role;

    // Direct API fallback to fetch authoritative user profile metadata from Clerk API
    if (!role && process.env.CLERK_SECRET_KEY) {
      try {
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        role = clerkUser.publicMetadata?.role;
      } catch (clerkErr) {
        console.error('Error fetching Clerk user metadata for admin verification:', clerkErr);
      }
    }

    // Unify roles checking metadata first, falling back to synced database role
    const finalRole = String(role || user.role).toUpperCase();

    const adminRoles = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'ANALYST'];
    if (!adminRoles.includes(finalRole)) {
      return res.status(403).json({ error: 'Forbidden: Admin clearance required by Clerk session metadata validation' });
    }

    next();
  } catch (err: any) {
    console.error('Admin authorization middleware exception:', err);
    res.status(500).json({ error: 'Internal server authorization verification failed' });
  }
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

    // Fetch up to 10 active API monitors that are due for checking
    const dueApiMonitors = await db.select({ id: apiMonitors.id })
      .from(apiMonitors)
      .where(and(
        eq(apiMonitors.active, true),
        lte(apiMonitors.nextCheckAt, now)
      ))
      .limit(10);

    for (const m of dueApiMonitors) {
      const lockDate = new Date(now.getTime() + 300 * 1000);
      await db.update(apiMonitors).set({ nextCheckAt: lockDate }).where(eq(apiMonitors.id, m.id));
      
      // Execute the API check engine
      await processApiMonitorCheck(m.id);
    }
  } catch (err) {
    console.error('[SCHEDULER] Local loop background check error:', err);
  }
};

// Start the background check runner (every 15 seconds)
setInterval(runSchedulerLoop, 15000);
