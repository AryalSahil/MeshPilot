import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export const adminDb = getFirestore();

// Interfaces matching firebase-blueprint.json
export interface FirestoreUser {
  uid: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreOrganization {
  id: string;
  name: string;
  ownerId: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreProject {
  id: string;
  organizationId: string;
  name: string;
  websiteUrl?: string;
  environment?: string;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  uptimeScore?: number;
  performanceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreMonitor {
  id: string;
  projectId: string;
  name: string;
  url: string;
  active: boolean;
  lastStatus?: string;
  lastResponseTimeMs?: number;
  lastCheckedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreMonitorCheck {
  id: string;
  monitorId: string;
  status: 'UP' | 'DOWN' | 'TIMEOUT' | 'ERROR';
  statusCode?: number;
  responseTimeMs: number;
  errorType?: string;
  errorMessage?: string;
  checkedAt: string;
}

// --- USER MANAGEMENT FUNCTIONS ---

export async function createFirestoreUser(userId: string, data: Omit<FirestoreUser, 'createdAt' | 'updatedAt'>): Promise<FirestoreUser> {
  const now = new Date().toISOString();
  const userRecord: FirestoreUser = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  await adminDb.collection('users').doc(userId).set(userRecord);
  return userRecord;
}

export async function getFirestoreUser(userId: string): Promise<FirestoreUser | null> {
  const snap = await adminDb.collection('users').doc(userId).get();
  if (!snap.exists) return null;
  return snap.data() as FirestoreUser;
}

export async function updateFirestoreUser(userId: string, data: Partial<Omit<FirestoreUser, 'uid' | 'createdAt'>>): Promise<void> {
  const now = new Date().toISOString();
  await adminDb.collection('users').doc(userId).update({
    ...data,
    updatedAt: now,
  });
}

export async function deleteFirestoreUser(userId: string): Promise<void> {
  await adminDb.collection('users').doc(userId).delete();
}

// --- ORGANIZATION MANAGEMENT FUNCTIONS ---

export async function createFirestoreOrganization(orgId: string, data: Omit<FirestoreOrganization, 'createdAt' | 'updatedAt'>): Promise<FirestoreOrganization> {
  const now = new Date().toISOString();
  const orgRecord: FirestoreOrganization = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  await adminDb.collection('organizations').doc(orgId).set(orgRecord);
  return orgRecord;
}

export async function getFirestoreOrganization(orgId: string): Promise<FirestoreOrganization | null> {
  const snap = await adminDb.collection('organizations').doc(orgId).get();
  if (!snap.exists) return null;
  return snap.data() as FirestoreOrganization;
}

export async function updateFirestoreOrganization(orgId: string, data: Partial<Omit<FirestoreOrganization, 'id' | 'createdAt'>>): Promise<void> {
  const now = new Date().toISOString();
  await adminDb.collection('organizations').doc(orgId).update({
    ...data,
    updatedAt: now,
  });
}

export async function deleteFirestoreOrganization(orgId: string): Promise<void> {
  await adminDb.collection('organizations').doc(orgId).delete();
}

// --- PROJECT MANAGEMENT FUNCTIONS ---

export async function createFirestoreProject(projectId: string, data: Omit<FirestoreProject, 'createdAt' | 'updatedAt'>): Promise<FirestoreProject> {
  const now = new Date().toISOString();
  const projectRecord: FirestoreProject = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  await adminDb.collection('projects').doc(projectId).set(projectRecord);
  return projectRecord;
}

export async function getFirestoreProject(projectId: string): Promise<FirestoreProject | null> {
  const snap = await adminDb.collection('projects').doc(projectId).get();
  if (!snap.exists) return null;
  return snap.data() as FirestoreProject;
}

export async function updateFirestoreProject(projectId: string, data: Partial<Omit<FirestoreProject, 'id' | 'createdAt'>>): Promise<void> {
  const now = new Date().toISOString();
  await adminDb.collection('projects').doc(projectId).update({
    ...data,
    updatedAt: now,
  });
}

export async function deleteFirestoreProject(projectId: string): Promise<void> {
  await adminDb.collection('projects').doc(projectId).delete();
}
