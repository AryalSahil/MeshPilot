import { pgTable, serial, text, timestamp, integer, boolean, real, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  name: text('name'),
  email: text('email').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('USER'), // USER, SUPER_ADMIN, ADMIN, SUPPORT, ANALYST
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, SUSPENDED
  emailVerified: boolean('email_verified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
});

// Organizations table
export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  ownerId: integer('owner_id').references(() => users.id),
  planId: text('plan_id').default('FREE'), // FREE, PRO, ENTERPRISE
  status: text('status').default('ACTIVE'), // ACTIVE, INACTIVE
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Organization Members table
export const organizationMembers = pgTable('organization_members', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').default('MEMBER'), // OWNER, ADMIN, MEMBER, VIEWER
  createdAt: timestamp('created_at').defaultNow(),
});

// Projects table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  websiteUrl: text('website_url'),
  environment: text('environment').default('PRODUCTION'), // PRODUCTION, STAGING, DEVELOPMENT
  status: text('status').default('ACTIVE'), // ACTIVE, PAUSED, ARCHIVED
  uptimeScore: integer('uptime_score').default(100),
  performanceScore: integer('performance_score').default(100),
  securityScore: integer('security_score').default(100),
  errorScore: integer('error_score').default(100),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Project Errors table
export const projectErrors = pgTable('project_errors', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  error: text('error').notNull(),
  endpoint: text('endpoint').notNull(),
  occurrences: integer('occurrences').default(1),
  lastSeen: timestamp('last_seen').defaultNow(),
  status: text('status').default('CRITICAL'), // CRITICAL, HIGH, WARNING, RESOLVED
});

// Project Metrics table (for timeseries response time, requests, error rate)
export const projectMetrics = pgTable('project_metrics', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  timestamp: timestamp('timestamp').defaultNow(),
  responseTime: integer('response_time'), // ms
  requests: integer('requests'),
  errorRate: real('error_rate'), // ratio, e.g. 0.02
});

// Audit Logs table for admin audit-trail
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').references(() => users.id, { onDelete: 'set null' }),
  actorEmail: text('actor_email').notNull(),
  action: text('action').notNull(),
  target: text('target').notNull(),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// --- NEW TABLES FOR REAL MONITORING ---

// Monitors table
export const monitors = pgTable('monitors', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  monitorType: text('monitor_type').notNull(), // HTTP, HTTPS
  method: text('method').default('GET').notNull(), // GET, HEAD
  intervalSeconds: integer('interval_seconds').default(300).notNull(), // 60, 300, 600, etc.
  timeoutMs: integer('timeout_ms').default(10000).notNull(), // 10000
  expectedStatusCode: integer('expected_status_code').default(200).notNull(), // 200
  active: boolean('active').default(true).notNull(),
  lastCheckedAt: timestamp('last_checked_at'),
  lastStatus: text('last_status').default('UNKNOWN').notNull(), // UP, DOWN, DEGRADED, UNKNOWN
  lastResponseTimeMs: integer('last_response_time_ms'),
  consecutiveFailures: integer('consecutive_failures').default(0).notNull(),
  nextCheckAt: timestamp('next_check_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Monitor Checks table
export const monitorChecks = pgTable('monitor_checks', {
  id: serial('id').primaryKey(),
  monitorId: integer('monitor_id').references(() => monitors.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull(), // UP, DOWN, TIMEOUT, ERROR
  statusCode: integer('status_code'),
  responseTimeMs: integer('response_time_ms'),
  errorType: text('error_type'),
  errorMessage: text('error_message'),
  checkedAt: timestamp('checked_at').defaultNow().notNull(),
}, (table) => ({
  monitorIdIdx: index('monitor_checks_monitor_id_idx').on(table.monitorId),
  checkedAtIdx: index('monitor_checks_checked_at_idx').on(table.checkedAt),
  monitorIdCheckedAtIdx: index('monitor_checks_monitor_id_checked_at_idx').on(table.monitorId, table.checkedAt),
}));

// Incidents table
export const incidents = pgTable('incidents', {
  id: serial('id').primaryKey(),
  monitorId: integer('monitor_id').references(() => monitors.id, { onDelete: 'cascade' }).notNull(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull(), // OPEN, RESOLVED
  startedAt: timestamp('started_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
  failureCount: integer('failure_count').default(0).notNull(),
  recoveryCount: integer('recovery_count').default(0).notNull(),
  summary: text('summary'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Alert Channels table
export const alertChannels = pgTable('alert_channels', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  type: text('type').default('EMAIL').notNull(), // EMAIL, SLACK, WEBHOOK
  name: text('name').notNull(),
  config: text('config'), // JSON string, e.g. email or webhook URL
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Alert Rules table
export const alertRules = pgTable('alert_rules', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  monitorId: integer('monitor_id').references(() => monitors.id, { onDelete: 'cascade' }),
  channelId: integer('channel_id').references(() => alertChannels.id, { onDelete: 'cascade' }).notNull(),
  triggerType: text('trigger_type').notNull(), // INCIDENT_OPEN, INCIDENT_RESOLVED, ALL
  createdAt: timestamp('created_at').defaultNow(),
});

// Usage Events table
export const usageEvents = pgTable('usage_events', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id, { onDelete: 'cascade' }).notNull(),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'cascade' }).notNull(),
  monitorId: integer('monitor_id').references(() => monitors.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(), // MONITORING_CHECK
  quantity: integer('quantity').default(1).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(organizationMembers),
  auditLogs: many(auditLogs),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, {
    fields: [organizations.ownerId],
    references: [users.id],
  }),
  members: many(organizationMembers),
  projects: many(projects),
  alertChannels: many(alertChannels),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.organizationId],
    references: [organizations.id],
  }),
  errors: many(projectErrors),
  metrics: many(projectMetrics),
  monitors: many(monitors),
  incidents: many(incidents),
  alertRules: many(alertRules),
}));

export const projectErrorsRelations = relations(projectErrors, ({ one }) => ({
  project: one(projects, {
    fields: [projectErrors.projectId],
    references: [projects.id],
  }),
}));

export const projectMetricsRelations = relations(projectMetrics, ({ one }) => ({
  project: one(projects, {
    fields: [projectMetrics.projectId],
    references: [projects.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

export const monitorsRelations = relations(monitors, ({ one, many }) => ({
  project: one(projects, {
    fields: [monitors.projectId],
    references: [projects.id],
  }),
  checks: many(monitorChecks),
  incidents: many(incidents),
  alertRules: many(alertRules),
}));

export const monitorChecksRelations = relations(monitorChecks, ({ one }) => ({
  monitor: one(monitors, {
    fields: [monitorChecks.monitorId],
    references: [monitors.id],
  }),
}));

export const incidentsRelations = relations(incidents, ({ one }) => ({
  monitor: one(monitors, {
    fields: [incidents.monitorId],
    references: [monitors.id],
  }),
  project: one(projects, {
    fields: [incidents.projectId],
    references: [projects.id],
  }),
}));

export const alertChannelsRelations = relations(alertChannels, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [alertChannels.organizationId],
    references: [organizations.id],
  }),
  alertRules: many(alertRules),
}));

export const alertRulesRelations = relations(alertRules, ({ one }) => ({
  project: one(projects, {
    fields: [alertRules.projectId],
    references: [projects.id],
  }),
  monitor: one(monitors, {
    fields: [alertRules.monitorId],
    references: [monitors.id],
  }),
  channel: one(alertChannels, {
    fields: [alertRules.channelId],
    references: [alertChannels.id],
  }),
}));

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [usageEvents.organizationId],
    references: [organizations.id],
  }),
  project: one(projects, {
    fields: [usageEvents.projectId],
    references: [projects.id],
  }),
  monitor: one(monitors, {
    fields: [usageEvents.monitorId],
    references: [monitors.id],
  }),
}));

// Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(), // Downtime, Security, Performance, Errors, Deployments, AI Diagnostics
  description: text('description').notNull(),
  read: boolean('read').default(false).notNull(),
  linkTo: text('link_to'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
