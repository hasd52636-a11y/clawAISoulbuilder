import { v4 as uuidv4 } from 'uuid';
import { getQuery, allQuery, runQuery } from '../database';

export interface AgentConfig {
  id: string;
  user_id: string;
  soul_id: string;
  agent_name: string;
  config_data: string;
  status: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
}

export class AgentConfigModel {
  static create(
    userId: string,
    soulId: string,
    agentName: string,
    configData: Record<string, string>,
    expiresAt?: Date
  ): AgentConfig {
    const id = uuidv4();
    const now = new Date().toISOString();
    const configDataJson = JSON.stringify(configData);
    
    // Default expiration: 12 hours from now
    const defaultExpiry = expiresAt || new Date(Date.now() + 12 * 60 * 60 * 1000);

    runQuery(
      `INSERT INTO agent_configs (id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, soulId, agentName, configDataJson, 'ready_for_deployment', now, now, defaultExpiry.toISOString()]
    );

    return {
      id,
      user_id: userId,
      soul_id: soulId,
      agent_name: agentName,
      config_data: configDataJson,
      status: 'ready_for_deployment',
      created_at: now,
      updated_at: now,
      expires_at: defaultExpiry.toISOString(),
    };
  }

  static findById(id: string): AgentConfig | undefined {
    return getQuery(
      `SELECT id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at 
       FROM agent_configs WHERE id = ?`,
      [id]
    );
  }

  static findByUserId(userId: string): AgentConfig[] {
    return allQuery(
      `SELECT id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at 
       FROM agent_configs WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
  }

  static findBySoulId(soulId: string): AgentConfig[] {
    return allQuery(
      `SELECT id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at 
       FROM agent_configs WHERE soul_id = ? ORDER BY created_at DESC`,
      [soulId]
    );
  }

  static findAll(): AgentConfig[] {
    return allQuery(
      `SELECT id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at 
       FROM agent_configs ORDER BY created_at DESC`
    );
  }

  static update(id: string, data: Partial<AgentConfig>): AgentConfig | undefined {
    const config = this.findById(id);
    if (!config) return undefined;

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.agent_name !== undefined) {
      updates.push('agent_name = ?');
      values.push(data.agent_name);
    }
    if (data.config_data !== undefined) {
      updates.push('config_data = ?');
      values.push(typeof data.config_data === 'string' ? data.config_data : JSON.stringify(data.config_data));
    }

    if (updates.length === 0) return config;

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    runQuery(
      `UPDATE agent_configs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static updateStatus(id: string, status: string): AgentConfig | undefined {
    return this.update(id, { status });
  }

  static delete(id: string): boolean {
    const result = runQuery(`DELETE FROM agent_configs WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  static getConfigData(id: string): Record<string, string> | undefined {
    const config = this.findById(id);
    if (!config) return undefined;
    try {
      return JSON.parse(config.config_data);
    } catch {
      return undefined;
    }
  }

  static count(): number {
    const result = getQuery(`SELECT COUNT(*) as count FROM agent_configs`);
    return result?.count || 0;
  }

  static countByStatus(status: string): number {
    const result = getQuery(`SELECT COUNT(*) as count FROM agent_configs WHERE status = ?`, [status]);
    return result?.count || 0;
  }
}

export default AgentConfigModel;
