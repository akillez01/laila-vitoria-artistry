import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const COOKIE_NAME = 'lv_admin_token';
const TOKEN_TTL = '7d';

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 12);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(adminId: number): string {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): { adminId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { adminId: number };
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export function getAdminIdFromRequest(req: Request): number | null {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  const payload = verifyToken(token);
  return payload?.adminId ?? null;
}
