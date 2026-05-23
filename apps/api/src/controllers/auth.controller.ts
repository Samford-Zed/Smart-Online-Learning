import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import { pool } from '../db/index';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      fullName, 
      email, 
      password, 
      role, 
      grade, 
      gradeLevel, 
      studentEmail,
      ...profileData 
    } = req.body;

    if (!fullName || !email || !password || !role) {
      res.status(400).json({ error: 'fullName, email, password, and role are required' });
      return;
    }

    const finalGrade = grade || gradeLevel;

    if (role === 'student' && !finalGrade) {
      res.status(400).json({ error: 'gradeLevel is required for student role' });
      return;
    }

    if (role === 'parent' && studentEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(studentEmail)) {
        res.status(400).json({ error: 'Invalid studentEmail format' });
        return;
      }
    }

    const user = await AuthService.registerUser(
      fullName, 
      email, 
      password, 
      role, 
      finalGrade, 
      studentEmail, 
      profileData
    );
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error: any) {
    if (error.message === 'Email already exists') {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { token, user } = await AuthService.login(email, password);
    res.status(200).json({ token, user });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = (req: Request, res: Response): void => {
  res.status(200).json((req as any).auth);
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).auth?.userId || (req as any).auth?.id;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    const { full_name, phone, bio, address } = req.body;
    const fields: string[] = [];
    const values: any[] = [];
    let i = 1;
    if (full_name !== undefined) { fields.push(`full_name = $${i++}`); values.push(full_name); }
    if (phone !== undefined)     { fields.push(`phone = $${i++}`); values.push(phone); }
    if (bio !== undefined)       { fields.push(`bio = $${i++}`); values.push(bio); }
    if (address !== undefined)   { fields.push(`address = $${i++}`); values.push(address); }
    if (!fields.length) { res.json((req as any).auth); return; }
    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${i}`, values);
    const updated = await pool.query(
      'SELECT id, full_name, email, role, phone, bio, address, created_at FROM users WHERE id = $1',
      [userId]
    );
    res.json(updated.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update profile' });
  }
};
