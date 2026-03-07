// db/models/ApiKey.ts
import { ApiKey as PrismaApiKey } from '@prisma/client';
import { getDatabase } from '../database';

const prisma = getDatabase();

export class ApiKeyModel {
  static async create(userId: string, key: string): Promise<PrismaApiKey> {
    return await prisma.apiKey.create({
      data: {
        user_id: userId,
        key
      }
    });
  }

  static async findById(id: string): Promise<PrismaApiKey | null> {
    return await prisma.apiKey.findUnique({
      where: { id }
    });
  }

  static async findByKey(key: string): Promise<PrismaApiKey | null> {
    return await prisma.apiKey.findUnique({
      where: { key }
    });
  }

  static async findByUserId(userId: string): Promise<PrismaApiKey[]> {
    return await prisma.apiKey.findMany({
      where: { user_id: userId }
    });
  }

  static async updateLastUsed(id: string): Promise<PrismaApiKey> {
    return await prisma.apiKey.update({
      where: { id },
      data: {
        lastUsed: new Date()
      }
    });
  }

  static async delete(id: string): Promise<PrismaApiKey> {
    return await prisma.apiKey.delete({
      where: { id }
    });
  }

  static async isValid(key: string): Promise<boolean> {
    const apiKey = await this.findByKey(key);
    return !!apiKey;
  }
}
