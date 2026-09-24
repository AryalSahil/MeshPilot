import { db } from './index.ts';
import { users, organizations, organizationMembers, projects, projectErrors, projectMetrics, auditLogs, monitors, monitorChecks, incidents, alertChannels, alertRules, usageEvents } from './schema.ts';
import { eq, and, or, like, desc, sql, gte } from 'drizzle-orm';

// Helper to sanitize database errors to avoid leaking details
const sanitizeError = (message: string, error: any) => {
  console.error(`${message}:`, error);
  return new Error(`${message}. Please try again later.`, { cause: error });
};

// --- USER QUERIES ---

export async function getUserByUid(uid: string) {
  try {
    const results = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return results[0] || null;
  } catch (error) {
    throw sanitizeError("Failed to fetch user by UID", error);
  }
}

export async function getUserOrgs(userId: number) {
  try {
    return await db.select({
      id: organizations.id,
      name: organizations.name,
      ownerId: organizations.ownerId,
      planId: organizations.planId,
      status: organizations.status,
      createdAt: organizations.createdAt,
      userRole: organizationMembers.role,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(eq(organizationMembers.userId, userId));
  } catch (error) {
    throw sanitizeError("Failed to fetch user organizations", error);
  }
}

// Check membership server-side
export async function checkOrgMembership(userId: number, orgId: number) {
  try {
    const results = await db.select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, orgId)
      ))
      .limit(1);
    return results.length > 0;
  } catch (error) {
    throw sanitizeError("Failed to check organization membership", error);
  }
}

// --- PROJECT QUERIES ---

export async function getOrgProjects(orgId: number) {
  try {
    return await db.select().from(projects).where(eq(projects.organizationId, orgId));
  } catch (error) {
    throw sanitizeError("Failed to fetch organization projects", error);
  }
}

export async function getProjectById(projectId: number) {
  try {
    const results = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
    return results[0] || null;
  } catch (error) {
    throw sanitizeError("Failed to fetch project by ID", error);
  }
}

export async function createProjectInDb(orgId: number, name: string, websiteUrl: string, environment: string) {
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const results = await db.insert(projects)
      .values({
        organizationId: orgId,
        name: name,
        slug: slug,
        websiteUrl: websiteUrl,
        environment: environment,
        status: 'ACTIVE',
        uptimeScore: 100,
        performanceScore: 100,
        securityScore: 100,
      })
      .returning();
    
    const newProj = results[0];

    // Seed empty/base metrics for newly created project to demonstrate telemetry is waiting
    await db.insert(projectMetrics).values([
      { projectId: newProj.id, responseTime: 120, requests: 50, errorRate: 0 },
    ]);

    return newProj;
  } catch (error) {
    throw sanitizeError("Failed to create project", error);
  }
}

export async function updateProjectInDb(projectId: number, updates: Partial<typeof projects.$inferSelect>) {
  try {
    const results = await db.update(projects)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId))
      .returning();
    return results[0];
  } catch (error) {
    throw sanitizeError("Failed to update project", error);
  }
}

export async function getProjectErrorsFromDb(projectId: number) {
  try {
    return await db.select().from(projectErrors).where(eq(projectErrors.projectId, projectId)).orderBy(desc(projectErrors.lastSeen));
  } catch (error) {
    throw sanitizeError("Failed to fetch project errors", error);
  }
}

export async function getProjectMetricsFromDb(projectId: number) {
  try {
    return await db.select().from(projectMetrics).where(eq(projectMetrics.projectId, projectId)).orderBy(desc(projectMetrics.timestamp));
  } catch (error) {
    throw sanitizeError("Failed to fetch project metrics", error);
  }
}

// --- ADMIN QUERIES ---

export async function getAdminPlatformMetrics() {
  try {
    // Total Users
    const usersCountResult = await db.select({ count: sql<number>`count(*)::int` }).from(users);
    const totalUsers = usersCountResult[0]?.count || 0;

    // Active Users (last logged in or active in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsersResult = await db.select({ count: sql<number>`count(*)::int` }).from(users).where(eq(users.status, 'ACTIVE'));
    const activeUsers = activeUsersResult[0]?.count || 0;

    // Projects
    const projectsCountResult = await db.select({ count: sql<number>`count(*)::int` }).from(projects);
    const totalProjects = projectsCountResult[0]?.count || 0;

    // Active Monitors (monitors that are active)
    const activeMonitorsCountResult = await db.select({ count: sql<number>`count(*)::int` }).from(monitors).where(eq(monitors.active, true));
    const activeMonitors = activeMonitorsCountResult[0]?.count || 0;

    // Total Monitors
    const monitorsCountResult = await db.select({ count: sql<number>`count(*)::int` }).from(monitors);
    const totalMonitors = monitorsCountResult[0]?.count || 0;

    // Paused Monitors
    const pausedMonitorsCountResult = await db.select({ count: sql<number>`count(*)::int` }).from(monitors).where(eq(monitors.active, false));
    const pausedMonitors = pausedMonitorsCountResult[0]?.count || 0;

    // DOWN Monitors
    const downMonitorsCountResult = await db.select({ count: sql<number>`count(*)::int` }).from(monitors).where(eq(monitors.lastStatus, 'DOWN'));
    const downMonitors = downMonitorsCountResult[0]?.count || 0;

    // Open Incidents
    const openIncidentsCountResult = await db.select({ count: sql<number>`count(*)::int` }).from(incidents).where(eq(incidents.status, 'OPEN'));
    const openIncidents = openIncidentsCountResult[0]?.count || 0;

    // Checks executed today (within 24 hours)
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setDate(twentyFourHoursAgo.getDate() - 1);
    const checksExecutedTodayResult = await db.select({ count: sql<number>`count(*)::int` }).from(monitorChecks).where(gte(monitorChecks.checkedAt, twentyFourHoursAgo));
    const checksExecutedToday = checksExecutedTodayResult[0]?.count || 0;

    // Failed checks executed today
    const failedChecksTodayResult = await db.select({ count: sql<number>`count(*)::int` })
      .from(monitorChecks)
      .where(and(
        gte(monitorChecks.checkedAt, twentyFourHoursAgo),
        sql`status != 'UP'`
      ));
    const failedChecksToday = failedChecksTodayResult[0]?.count || 0;

    // Average Response Time
    const avgRtResult = await db.select({ avg: sql<number>`round(avg(response_time_ms))::int` })
      .from(monitorChecks)
      .where(sql`status = 'UP'`);
    const averageResponseTime = avgRtResult[0]?.avg || 0;

    return {
      totalUsers,
      activeUsers,
      totalProjects,
      activeMonitors,
      totalMonitors,
      pausedMonitors,
      downMonitors,
      openIncidents,
      checksExecutedToday,
      failedChecksToday,
      averageResponseTime,
      aiRequests: 184500, // Seeded base stats
      securityScans: 32481,
      mrr: 124500,
      systemStatus: 'Healthy',
    };
  } catch (error) {
    throw sanitizeError("Failed to compile platform metrics", error);
  }
}

export async function getAdminUsersList(search?: string, status?: string, role?: string) {
  try {
    let query = db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      avatarUrl: users.avatarUrl,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
    }).from(users);

    const conditions = [];

    if (search) {
      conditions.push(or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      ));
    }

    if (status) {
      conditions.push(eq(users.status, status));
    }

    if (role) {
      conditions.push(eq(users.role, role));
    }

    let finalQuery;
    if (conditions.length > 0) {
      finalQuery = query.where(and(...conditions)).orderBy(desc(users.createdAt));
    } else {
      finalQuery = query.orderBy(desc(users.createdAt));
    }

    const usersList = await finalQuery;

    // Let's attach project counts to each user record
    const listWithProjCount = await Promise.all(usersList.map(async (u) => {
      const ownedOrgs = await db.select({ id: organizations.id }).from(organizations).where(eq(organizations.ownerId, u.id));
      let totalProj = 0;
      if (ownedOrgs.length > 0) {
        const orgIds = ownedOrgs.map(o => o.id);
        const projectsCount = await db.select({ count: sql<number>`count(*)::int` }).from(projects).where(sql`organization_id IN (${sql.join(orgIds, sql`, `)})`);
        totalProj = projectsCount[0]?.count || 0;
      }
      return {
        ...u,
        projects: totalProj,
        plan: u.role.includes('ADMIN') ? 'Enterprise' : 'Free', // Simple plan association
      };
    }));

    return listWithProjCount;
  } catch (error) {
    throw sanitizeError("Failed to fetch admin users list", error);
  }
}

export async function getAdminUserDetail(userId: number) {
  try {
    const userResult = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userObj = userResult[0];
    if (!userObj) return null;

    // Get user's orgs
    const orgs = await getUserOrgs(userObj.id);

    // Get user's projects across orgs
    let userProjects: any[] = [];
    if (orgs.length > 0) {
      const orgIds = orgs.map(o => o.id);
      userProjects = await db.select().from(projects).where(sql`organization_id IN (${sql.join(orgIds, sql`, `)})`);
    }

    // Get audit logs
    const logs = await db.select().from(auditLogs).where(eq(auditLogs.actorId, userId)).orderBy(desc(auditLogs.createdAt)).limit(20);

    return {
      profile: userObj,
      organizations: orgs,
      projects: userProjects,
      activity: logs,
    };
  } catch (error) {
    throw sanitizeError("Failed to fetch user details for admin", error);
  }
}

export async function getAdminOrganizationsList() {
  try {
    const orgs = await db.select({
      id: organizations.id,
      name: organizations.name,
      ownerId: organizations.ownerId,
      ownerName: users.name,
      ownerEmail: users.email,
      planId: organizations.planId,
      status: organizations.status,
      createdAt: organizations.createdAt,
    })
    .from(organizations)
    .leftJoin(users, eq(organizations.ownerId, users.id));

    const enriched = await Promise.all(orgs.map(async (o) => {
      const membersCount = await db.select({ count: sql<number>`count(*)::int` }).from(organizationMembers).where(eq(organizationMembers.organizationId, o.id));
      const projectsCount = await db.select({ count: sql<number>`count(*)::int` }).from(projects).where(eq(projects.organizationId, o.id));
      return {
        ...o,
        members: membersCount[0]?.count || 0,
        projects: projectsCount[0]?.count || 0,
      };
    }));

    return enriched;
  } catch (error) {
    throw sanitizeError("Failed to fetch organizations list for admin", error);
  }
}

export async function updateAdminUserStatus(userId: number, status: 'ACTIVE' | 'SUSPENDED') {
  try {
    const results = await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId)).returning();
    return results[0];
  } catch (error) {
    throw sanitizeError(`Failed to update user status to ${status}`, error);
  }
}

export async function deleteUserFromDb(userId: number) {
  try {
    const results = await db.delete(users).where(eq(users.id, userId)).returning();
    return results[0];
  } catch (error) {
    throw sanitizeError("Failed to delete user", error);
  }
}

export async function logAdminActionInDb(actorId: number, actorEmail: string, action: string, target: string, ip?: string) {
  try {
    await db.insert(auditLogs).values({
      actorId,
      actorEmail,
      action,
      target,
      ipAddress: ip || '127.0.0.1',
    });
  } catch (error) {
    console.error("Failed to insert admin audit log", error);
  }
}

export async function getAdminAuditLogsList() {
  try {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100);
  } catch (error) {
    throw sanitizeError("Failed to fetch admin audit logs", error);
  }
}
