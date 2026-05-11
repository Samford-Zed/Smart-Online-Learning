import bcrypt from 'bcrypt';
import * as SettingsModel from '../models/settings.model';
import * as UserModel from '../models/user.model';
import { pool } from '../db/index';

export const updatePassword = async (userId: number, currentPasswordPlain: string, newPasswordPlain: string): Promise<void> => {
  const result = await pool.query('SELECT password FROM users WHERE id = $1', [userId]);
  if (result.rows.length === 0) throw new Error('User not found');
  
  const user = result.rows[0];
  const isMatch = await bcrypt.compare(currentPasswordPlain, user.password);
  if (!isMatch) throw new Error('Invalid current password');
  
  const newPasswordHash = await bcrypt.hash(newPasswordPlain, 10);
  await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPasswordHash, userId]);
};

export const getPreferences = async (userId: number) => {
  return await SettingsModel.getSettingsByUserId(userId);
};

export const updatePreferences = async (userId: number, settings: Partial<SettingsModel.UserSettings>) => {
  return await SettingsModel.updateSettings(userId, settings);
};

export const getAcademicSettings = async (userId: number) => {
  const settings = await SettingsModel.getSettingsByUserId(userId);
  const userResult = await pool.query('SELECT grade_level as "gradeLevel" FROM users WHERE id = $1', [userId]);
  
  return {
    school: settings.school || '',
    gradeLevel: userResult.rows[0]?.gradeLevel || '',
    goals: settings.goals || ''
  };
};

export const updateAcademicSettings = async (userId: number, academic: { school?: string; gradeLevel?: string; goals?: string }) => {
  if (academic.gradeLevel) {
    await pool.query('UPDATE users SET grade_level = $1 WHERE id = $2', [academic.gradeLevel, userId]);
  }
  
  return await SettingsModel.updateSettings(userId, { 
    school: academic.school, 
    goals: academic.goals 
  });
};

export const getSessions = async (userId: number) => {
  return await SettingsModel.getSessionsByUserId(userId);
};

export const terminateSession = async (userId: number, sessionId: number) => {
  return await SettingsModel.deleteSession(userId, sessionId);
};
