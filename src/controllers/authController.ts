import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', ['user']);
    if (roleResult.rows.length === 0) {
      return res.status(500).json({ message: "Default user role not found" });
    }
    
    const userRoleId = roleResult.rows[0].id;
    
    const { rows } = await pool.query(
      'INSERT INTO users (username, password, role_id) VALUES ($1, $2, $3) RETURNING id',
      [username, hashedPassword, userRoleId]
    );
    
    res.status(201).json({ 
      message: "User registered successfully", 
      userId: rows[0].id,
      role: 'user'
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && 'code' in error && error.code === '23505') {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Error registering new user" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const { rows } = await pool.query(
      'SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.username = $1',
      [username]
    );
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    
    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: "Invalid password" });
    
    const token = jwt.sign(
      { id: user.id, role: user.role_name }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '24h' }
    );
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Error logging in", error: error instanceof Error ? error.message : String(error) });
  }
};

export const changeUserRole = async (req: Request, res: Response) => {
  const { userId, newRole } = req.body;
  try {
    const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [newRole]);
    if (roleResult.rows.length === 0) return res.status(400).json({ message: "Invalid role" });
    
    const roleId = roleResult.rows[0].id;
    
    const { rowCount } = await pool.query(
      'UPDATE users SET role_id = $1 WHERE id = $2',
      [roleId, userId]
    );

    if (rowCount === 0) return res.status(404).json({ message: "User not found" });
    
    res.json({ message: "User role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing user role" });
  }
};