import bcrypt from 'bcryptjs';
import { User } from './user.model';
import { connectDB } from '../../config/db';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors';
import type { RegisterInput, LoginInput } from './auth.validator';
import type { IUser } from '../../shared/types';

const SALT_ROUNDS = 12;

export async function registerUser(input: RegisterInput): Promise<Omit<IUser, 'password'>> {
  await connectDB();

  const existingEmail = await User.findOne({ email: input.email.toLowerCase() });
  if (existingEmail) {
    throw new ConflictError('Email already registered');
  }

  const existingUsername = await User.findOne({ username: input.username.toLowerCase() });
  if (existingUsername) {
    throw new ConflictError('Username already taken');
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    username: input.username.toLowerCase(),
    password: hashedPassword,
  });

  const userObj = user.toObject();
  const { password: _, ...userWithoutPassword } = userObj;
  return userWithoutPassword as Omit<IUser, 'password'>;
}

export async function loginUser(input: LoginInput): Promise<Omit<IUser, 'password'>> {
  await connectDB();

  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValidPassword = await bcrypt.compare(input.password, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const userObj = user.toObject();
  const { password: _, ...userWithoutPassword } = userObj;
  return userWithoutPassword as Omit<IUser, 'password'>;
}

export async function getUserById(userId: string): Promise<Omit<IUser, 'password'> | null> {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return null;
  return user.toObject() as Omit<IUser, 'password'>;
}

export async function getUserByEmail(email: string): Promise<Omit<IUser, 'password'> | null> {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  return user.toObject() as Omit<IUser, 'password'>;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<IUser, 'name' | 'avatar'>>
): Promise<Omit<IUser, 'password'>> {
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, updates, { new: true });
  if (!user) throw new NotFoundError('User not found');
  return user.toObject() as Omit<IUser, 'password'>;
}
