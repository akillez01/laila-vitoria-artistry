import type { Request, Response, NextFunction } from 'express';
import { getAdminIdFromRequest } from '../auth.js';

export interface AuthedRequest extends Request {
  adminId?: number;
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const adminId = getAdminIdFromRequest(req);
  if (!adminId) {
    return res.status(401).json({ error: 'Não autenticado.' });
  }
  req.adminId = adminId;
  next();
}
