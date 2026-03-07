// db/models/User.ts
import { User as PrismaUser } from '@prisma/client';
import { getDatabase } from '../database';

const prisma = getDatabase();

export class UserModel {
  static async create(email: string, name?: string): Promise<PrismaUser> {
    return await prisma.user.create({
      data: {
        email,
        name
      }
    });
  }

  static async findById(id: string): Promise<PrismaUser | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  static async findByEmail(email: string): Promise<PrismaUser | null> {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  static async update(id: string, data: Partial<PrismaUser>): Promise<PrismaUser> {
    return await prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id: string): Promise<PrismaUser> {
    return await prisma.user.delete({
      where: { id }
    });
  }

  static async findAll(): Promise<PrismaUser[]> {
    return await prisma.user.findMany();
  }
}
