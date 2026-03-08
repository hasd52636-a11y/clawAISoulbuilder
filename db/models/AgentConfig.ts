// db/models/AgentConfig.ts
import { Prisma } from '@prisma/client';
import { getDatabase } from '../database';

type PrismaAgentConfig = Prisma.AgentConfig;

const prisma = getDatabase();

export class AgentConfigModel {
  static async create(
    userId: string,
    soulId: string,
    agentName: string,
    config: any,
    expiresAt: Date
  ): Promise<PrismaAgentConfig> {
    return await prisma.agentConfig.create({
      data: {
        user_id: userId,
        soul_id: soulId,
        agent_name: agentName,
        config,
        expiresAt
      }
    });
  }

  static async findById(id: string): Promise<PrismaAgentConfig | null> {
    return await prisma.agentConfig.findUnique({
      where: { id }
    });
  }

  static async findByUserId(userId: string): Promise<PrismaAgentConfig[]> {
    return await prisma.agentConfig.findMany({
      where: { user_id: userId }
    });
  }

  static async update(id: string, data: Partial<PrismaAgentConfig>): Promise<PrismaAgentConfig> {
    return await prisma.agentConfig.update({
      where: { id },
      data
    });
  }

  static async delete(id: string): Promise<PrismaAgentConfig> {
    return await prisma.agentConfig.delete({
      where: { id }
    });
  }

  static async findExpired(): Promise<PrismaAgentConfig[]> {
    return await prisma.agentConfig.findMany({
      where: {
        expiresAt: { lte: new Date() }
      }
    });
  }
}
