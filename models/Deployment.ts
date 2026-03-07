import { v4 as uuidv4 } from 'uuid';
import { getQuery, allQuery, runQuery } from '../database';

export interface Deployment {
  id: string;
  config_id: string;
  user_id: string;
  target_system: string;
  status: string;
  result?: string;
  created_at: string;
  updated_at: string;
}

export class DeploymentModel {
  static create(
    configId: string,
    userId: string,
    targetSystem: string
  ): Deployment {
    const id = uuidv4();
    const now = new Date().toISOString();

    runQuery(
      `INSERT INTO deployments (id, config_id, user_id, target_system, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, configId, userId, targetSystem, 'pending', now, now]
    );

    return {
      id,
      config_id: configId,
      user_id: userId,
      target_system: targetSystem,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };
  }

  static findById(id: string): Deployment | undefined {
    return getQuery(
      `SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE id = ?`,
      [id]
    );
  }

  static findByConfigId(configId: string): Deployment[] {
    return allQuery(
      `SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE config_id = ? ORDER BY created_at DESC`,
      [configId]
    );
  }

  static findByUserId(userId: string): Deployment[] {
    return allQuery(
      `SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
  }

  static findByStatus(status: string): Deployment[] {
    return allQuery(
      `SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE status = ? ORDER BY created_at DESC`,
      [status]
    );
  }

  static findAll(): Deployment[] {
    return allQuery(
      `SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments ORDER BY created_at DESC`
    );
  }

  static update(id: string, data: Partial<Deployment>): Deployment | undefined {
    const deployment = this.findById(id);
    if (!deployment) return undefined;

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.result !== undefined) {
      updates.push('result = ?');
      values.push(typeof data.result === 'string' ? data.result : JSON.stringify(data.result));
    }

    if (updates.length === 0) return deployment;

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    runQuery(
      `UPDATE deployments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static updateStatus(id: string, status: string, result?: any): Deployment | undefined {
    return this.update(id, {
      status,
      result: result ? JSON.stringify(result) : undefined,
    });
  }

  static delete(id: string): boolean {
    const result = runQuery(`DELETE FROM deployments WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  static getResult(id: string): any | undefined {
    const deployment = this.findById(id);
    if (!deployment || !deployment.result) return undefined;
    try {
      return JSON.parse(deployment.result);
    } catch {
      return deployment.result;
    }
  }

  static count(): number {
    const result = getQuery(`SELECT COUNT(*) as count FROM deployments`);
    return result?.count || 0;
  }

  static countByStatus(status: string): number {
    const result = getQuery(`SELECT COUNT(*) as count FROM deployments WHERE status = ?`, [status]);
    return result?.count || 0;
  }

  static getLatestByConfigId(configId: string): Deployment | undefined {
    return getQuery(
      `SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE config_id = ? ORDER BY created_at DESC LIMIT 1`,
      [configId]
    );
  }
}

export default DeploymentModel;
