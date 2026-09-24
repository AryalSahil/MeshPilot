import { db } from '../../db/index.ts';
import { projects, monitors, organizations } from '../../db/schema.ts';
import { eq, count, sql } from 'drizzle-orm';

export interface PlanLimit {
  maxProjects: number;
  maxMonitorsPerProject: number;
  minIntervalSeconds: number;
}

export const PLAN_LIMITS: Record<string, PlanLimit> = {
  FREE: {
    maxProjects: 2,
    maxMonitorsPerProject: 3,
    minIntervalSeconds: 300, // 5 minutes
  },
  PRO: {
    maxProjects: 10,
    maxMonitorsPerProject: 15,
    minIntervalSeconds: 60, // 1 minute
  },
  ENTERPRISE: {
    maxProjects: 100,
    maxMonitorsPerProject: 100,
    minIntervalSeconds: 10, // 10 seconds
  },
};

export async function validateProjectLimit(orgId: number): Promise<void> {
  // 1. Fetch organization plan ID
  const org = await db.query.organizations.findFirst({
    where: (o, { eq }) => eq(o.id, orgId),
  });

  if (!org) {
    throw new Error('Organization not found.');
  }

  const planId = (org.planId || 'FREE').toUpperCase();
  const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.FREE;

  // 2. Count existing projects
  const currentCountResult = await db.select({ count: sql<number>`count(*)::int` })
    .from(projects)
    .where(eq(projects.organizationId, orgId));

  const currentCount = currentCountResult[0]?.count || 0;

  if (currentCount >= limits.maxProjects) {
    throw new Error(`PLAN_LIMIT_REACHED: Your ${planId} workspace is limited to ${limits.maxProjects} projects. Upgrade to PRO for higher capabilities.`);
  }
}

export async function validateMonitorLimits(projectId: number, requestedIntervalSeconds: number): Promise<void> {
  // 1. Fetch project and organization plan
  const proj = await db.query.projects.findFirst({
    where: (p, { eq }) => eq(p.id, projectId),
    with: {
      organization: true,
    } as any,
  }) as any;

  if (!proj || !proj.organization) {
    throw new Error('Project or associated organization not found.');
  }

  const planId = (proj.organization.planId || 'FREE').toUpperCase();
  const limits = PLAN_LIMITS[planId] || PLAN_LIMITS.FREE;

  // 2. Enforce minimum interval checks
  if (requestedIntervalSeconds < limits.minIntervalSeconds) {
    throw new Error(`PLAN_LIMIT_REACHED: Your ${planId} workspace supports a minimum monitoring interval of ${limits.minIntervalSeconds}s. Upgrade to PRO to enable 1-minute intervals.`);
  }

  // 3. Count existing monitors for the project
  const currentCountResult = await db.select({ count: sql<number>`count(*)::int` })
    .from(monitors)
    .where(eq(monitors.projectId, projectId));

  const currentCount = currentCountResult[0]?.count || 0;

  if (currentCount >= limits.maxMonitorsPerProject) {
    throw new Error(`PLAN_LIMIT_REACHED: This project has reached the limit of ${limits.maxMonitorsPerProject} active monitors allowed on your ${planId} workspace. Upgrade to unlock additional channels.`);
  }
}
