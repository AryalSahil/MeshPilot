import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users, organizations, organizationMembers } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: typeof users.$inferSelect;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    const email = decodedToken.email || '';
    const name = decodedToken.name || email.split('@')[0] || 'User';
    const avatarUrl = decodedToken.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

    // Sync to PostgreSQL using Drizzle upsert
    // To handle concurrent inserts of the same user ID safely
    const existing = await db.select().from(users).where(eq(users.uid, decodedToken.uid)).limit(1);
    
    let dbUserRecord;
    
    if (existing.length === 0) {
      // First, create the user
      const inserted = await db.insert(users)
        .values({
          uid: decodedToken.uid,
          email: email,
          name: name,
          avatarUrl: avatarUrl,
          role: email.endsWith('@meshpilot.com') ? 'ADMIN' : 'USER', // Auto role determination if matching domain, else USER
          status: 'ACTIVE',
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email: email,
            name: name,
            avatarUrl: avatarUrl,
          }
        })
        .returning();
      
      dbUserRecord = inserted[0];

      // Automatically create a default organization and organization_member row for new users
      const orgName = `${dbUserRecord.name || 'My'}'s Workspace`;
      const insertedOrg = await db.insert(organizations)
        .values({
          name: orgName,
          ownerId: dbUserRecord.id,
          planId: 'FREE',
          status: 'ACTIVE',
        })
        .returning();

      const defaultOrg = insertedOrg[0];

      // Add to organization_members
      await db.insert(organizationMembers)
        .values({
          organizationId: defaultOrg.id,
          userId: dbUserRecord.id,
          role: 'OWNER',
        });
    } else {
      // User already exists, update last login at or update if needed
      dbUserRecord = existing[0];
      await db.update(users)
        .set({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, dbUserRecord.id));
    }

    req.dbUser = dbUserRecord;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
