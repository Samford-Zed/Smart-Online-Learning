import { pool } from '../db/index';

export interface UserSettings {
  userId: number;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'md' | 'lg';
  highContrast: boolean;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  school?: string;
  goals?: string;
}

export interface UserSession {
  sessionId: number;
  userId: number;
  device: string;
  location: string;
  lastActive: string;
}

export const getSettingsByUserId = async (userId: number): Promise<UserSettings> => {
  const result = await pool.query(
    'SELECT user_id as "userId", theme, font_size as "fontSize", high_contrast as "highContrast", language, notifications, school, goals FROM user_settings WHERE user_id = $1',
    [userId]
  );
  
  if (result.rows.length === 0) {
    // Return defaults if no settings found
    return {
      userId,
      theme: 'system',
      fontSize: 'md',
      highContrast: false,
      language: 'en',
      notifications: { email: true, push: true, sms: false }
    };
  }
  
  return result.rows[0];
};

export const updateSettings = async (userId: number, settings: Partial<UserSettings>): Promise<UserSettings> => {
  const current = await getSettingsByUserId(userId);
  const updated = { ...current, ...settings };
  
  await pool.query(
    `INSERT INTO user_settings (user_id, theme, font_size, high_contrast, language, notifications, school, goals)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id) DO UPDATE SET
     theme = EXCLUDED.theme,
     font_size = EXCLUDED.font_size,
     high_contrast = EXCLUDED.high_contrast,
     language = EXCLUDED.language,
     notifications = EXCLUDED.notifications,
     school = EXCLUDED.school,
     goals = EXCLUDED.goals`,
    [
      userId,
      updated.theme,
      updated.fontSize,
      updated.highContrast,
      updated.language,
      JSON.stringify(updated.notifications),
      updated.school,
      updated.goals
    ]
  );
  
  return updated;
};

export const getSessionsByUserId = async (userId: number): Promise<UserSession[]> => {
  const result = await pool.query(
    'SELECT id as "sessionId", user_id as "userId", device, location, last_active as "lastActive" FROM sessions WHERE user_id = $1 ORDER BY last_active DESC',
    [userId]
  );
  return result.rows;
};

export const deleteSession = async (userId: number, sessionId: number): Promise<void> => {
  await pool.query('DELETE FROM sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
};

export const createSession = async (userId: number, device: string, location: string): Promise<UserSession> => {
  const result = await pool.query(
    'INSERT INTO sessions (user_id, device, location) VALUES ($1, $2, $3) RETURNING id as "sessionId", user_id as "userId", device, location, last_active as "lastActive"',
    [userId, device, location]
  );
  return result.rows[0];
};
