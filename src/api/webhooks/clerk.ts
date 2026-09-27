import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../db/index.ts';
import { users, organizations, organizationMembers, loginActivities } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';

function verifyClerkSignature(req: Request, bodyString: string, secret: string): boolean {
  const svixId = req.headers['svix-id'] as string;
  const svixTimestamp = req.headers['svix-timestamp'] as string;
  const svixSignature = req.headers['svix-signature'] as string;

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false;
  }

  const signedPayload = `${svixId}.${svixTimestamp}.${bodyString}`;
  const actualSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret;
  const secretBuffer = Buffer.from(actualSecret, 'base64');

  const hmac = crypto.createHmac('sha256', secretBuffer);
  hmac.update(signedPayload);
  const mySignature = hmac.digest('base64');

  const passedSignatures = svixSignature.split(' ').map(sig => {
    const parts = sig.split(',');
    return parts.length === 2 && parts[0] === 'v1' ? parts[1] : null;
  }).filter(Boolean);

  return passedSignatures.includes(mySignature);
}

export async function handleClerkWebhook(req: Request, res: Response) {
  // If request has rawBody (parsed with our custom express.raw parser), use it
  const payloadString = req.body instanceof Buffer 
    ? req.body.toString('utf-8') 
    : typeof req.body === 'string'
    ? req.body
    : JSON.stringify(req.body);

  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET || 'whsec_3yEysqneAjuDKB/saTbS2Gn7gcvVlzIv';

  if (secret) {
    const verified = verifyClerkSignature(req, payloadString, secret);
    if (!verified) {
      console.error('Clerk webhook signature verification failed.');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  }

  let evt: any;
  try {
    evt = typeof req.body === 'object' && !(req.body instanceof Buffer) ? req.body : JSON.parse(payloadString);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const { data, type } = evt;
  console.log(`Clerk Modular Webhook Event Received: ${type}`);

  try {
    if (type === 'user.created') {
      const clerkUserId = data.id;
      const email = data.email_addresses?.[0]?.email_address || '';
      const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || email.split('@')[0] || 'User';
      const avatarUrl = data.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      const existing = await db.select().from(users).where(eq(users.uid, clerkUserId)).limit(1);
      let dbUserRecord;

      if (existing.length === 0) {
        const inserted = await db.insert(users)
          .values({
            uid: clerkUserId,
            email: email,
            name: name,
            avatarUrl: avatarUrl,
            role: email.endsWith('@meshpilot.com') ? 'ADMIN' : 'USER',
            status: 'ACTIVE',
          })
          .returning();
        dbUserRecord = inserted[0];

        // Create Workspace
        const orgName = `${dbUserRecord.name || 'My'}'s Workspace`;
        const insertedOrg = await db.insert(organizations)
          .values({
            name: orgName,
            ownerId: dbUserRecord.id,
            planId: 'FREE',
            status: 'ACTIVE',
          })
          .returning();

        await db.insert(organizationMembers)
          .values({
            organizationId: insertedOrg[0].id,
            userId: dbUserRecord.id,
            role: 'OWNER',
          });
      } else {
        dbUserRecord = existing[0];
      }

      await db.insert(loginActivities).values({
        userId: dbUserRecord.id,
        clerkUserId: clerkUserId,
        eventType: 'REGISTRATION',
        userAgent: req.headers['user-agent'] || 'Webhook Agent',
        ipAddress: req.ip || '127.0.0.1',
      });

    } else if (type === 'user.updated') {
      const clerkUserId = data.id;
      const email = data.email_addresses?.[0]?.email_address || '';
      const name = `${data.first_name || ''} ${data.last_name || ''}`.trim() || email.split('@')[0] || 'User';
      const avatarUrl = data.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      await db.update(users)
        .set({
          email,
          name,
          avatarUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.uid, clerkUserId));

    } else if (type === 'user.deleted') {
      const clerkUserId = data.id;
      await db.update(users)
        .set({ status: 'SUSPENDED', updatedAt: new Date() })
        .where(eq(users.uid, clerkUserId));

    } else if (type === 'session.created') {
      const clerkUserId = data.user_id;
      const sessionId = data.id;

      const existing = await db.select().from(users).where(eq(users.uid, clerkUserId)).limit(1);
      if (existing.length > 0) {
        const dbUserRecord = existing[0];
        await db.insert(loginActivities).values({
          userId: dbUserRecord.id,
          clerkUserId: clerkUserId,
          eventType: 'SIGN_IN',
          sessionId: sessionId,
          userAgent: req.headers['user-agent'] || 'Webhook Session Agent',
          ipAddress: req.ip || '127.0.0.1',
        });

        await db.update(users)
          .set({ lastLoginAt: new Date(), updatedAt: new Date() })
          .where(eq(users.id, dbUserRecord.id));
      }
    } else if (type === 'session.ended' || type === 'session.removed') {
      const clerkUserId = data.user_id;
      const sessionId = data.id;

      const existing = await db.select().from(users).where(eq(users.uid, clerkUserId)).limit(1);
      if (existing.length > 0) {
        const dbUserRecord = existing[0];
        await db.insert(loginActivities).values({
          userId: dbUserRecord.id,
          clerkUserId: clerkUserId,
          eventType: 'SIGN_OUT',
          sessionId: sessionId,
          userAgent: req.headers['user-agent'] || 'Webhook Session Agent',
          ipAddress: req.ip || '127.0.0.1',
        });
      }
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error('Modular Webhook Execution Failure:', err);
    res.status(500).json({ error: err.message || 'Webhook processing failed' });
  }
}
