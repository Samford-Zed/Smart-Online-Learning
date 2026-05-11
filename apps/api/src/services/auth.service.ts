import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as UserModel from '../models/user.model';

export const registerUser = async (fullName: string, email: string, passwordPlain: string, role: string, gradeLevel?: string, studentEmail?: string, profileData?: any) => {
  const existingUser = await UserModel.findUserByEmail(email);
  if (existingUser) throw new Error('Email already exists');

  const passwordHash = await bcrypt.hash(passwordPlain, 10);
  const user = await UserModel.registerUser(fullName, email, passwordHash, role, gradeLevel, studentEmail, profileData);
  return user;
};

export const login = async (email: string, passwordPlain: string) => {
  const user = await UserModel.findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(passwordPlain, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: user.id, fullName: user.fullName, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return { token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role, gradeLevel: user.gradeLevel } };
};
