// db/models/Deployment.ts
import { Deployment as PrismaDeployment } from '@prisma/client';
import { getDatabase } from '../database';

const prisma = getDatabase();

export class DeploymentModel {
  static async create(
    configId: string,
    userId: string,
    targetSystem: string
  ): Promise<PrismaDeployment> {
    return await prisma.deployment.create({
      data: {
        config_id: configId,
        user_id: userId,
        target_system: targetSystem
      }
    });
  }

  static async findById(id: string): Promise<PrismaDeployment | null> {
    return await prisma.deployment.findUnique({
      where: { id }
    });
  }

  static async findByConfigId(configId: string): Promise<PrismaDeployment[]> {
    return await prisma.deployment.findMany({
      where: { config_id: configId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getLatestByConfigId(configId: string): Promise<PrismaDeployment | null> {
    const deployments = await this.findByConfigId(configId);
    return deployments[0] || null;
  }

  static async update(id: string, data: Partial<PrismaDeployment>): Promise<PrismaDeployment> {
    return await prisma.deployment.update({
      where: { id },
      data
    });
  }

  static async delete(id: string): Promise<PrismaDeployment> {
    return await prisma.deployment.delete({
      where: { id }
    });
  }

  static async findByUserId(userId: string): Promise<PrismaDeployment[]> {
    return await prisma.deployment.findMany({
      where: { user_id: userId }
    });
  }
}
