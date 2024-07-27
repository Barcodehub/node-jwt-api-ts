import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

interface DecodedToken {
  id: number;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: string;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['x-access-token'] as string;
  if (!token) return res.status(403).json({ message: "No token provided" });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: "Unauthorized" });
    const decodedToken = decoded as DecodedToken;
    req.userId = decodedToken.id;
    req.userRole = decodedToken.role;
    next();
  });
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rows } = await pool.query(
      'SELECT r.name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = $1',
      [req.userId]
    );
    if (rows.length === 0 || rows[0].name !== 'admin') {
      return res.status(403).json({ message: "Require Admin Role!" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking user role" });
  }
};