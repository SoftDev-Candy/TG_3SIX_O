/**
 * Authentication utilities
 */

import bcrypt from 'bcrypt';
import { FastifyRequest } from 'fastify';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Mock JWT - For hackathon demo
 * In production, use @fastify/jwt properly
 */
export function generateToken(userId: string, username: string): string {
  const payload = { userId, username, iat: Date.now() };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function verifyToken(token: string): { userId: string; username: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    return { userId: payload.userId, username: payload.username };
  } catch {
    return null;
  }
}

/**
 * Extract user from request
 */
export function getUserFromRequest(request: FastifyRequest): { userId: string; username: string } | null {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.substring(7);
  return verifyToken(token);
}

/**
 * Require authentication
 */
export function requireAuth(request: FastifyRequest): { userId: string; username: string } {
  const user = getUserFromRequest(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}
