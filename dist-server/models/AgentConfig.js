"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentConfigModel = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
class AgentConfigModel {
    static create(userId, soulId, agentName, configData, expiresAt) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const configDataJson = JSON.stringify(configData);
        // Default expiration: 12 hours from now
        const defaultExpiry = expiresAt || new Date(Date.now() + 12 * 60 * 60 * 1000);
        (0, database_1.runQuery)(`INSERT INTO agent_configs (id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, userId, soulId, agentName, configDataJson, 'ready_for_deployment', now, now, defaultExpiry.toISOString()]);
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
    static findById(id) {
        return (0, database_1.getQuery)(`SELECT id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at 
       FROM agent_configs WHERE id = ?`, [id]);
    }
    static findByUserId(userId) {
        return (0, database_1.allQuery)(`SELECT id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at 
       FROM agent_configs WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
    }
    static findBySoulId(soulId) {
        return (0, database_1.allQuery)(`SELECT id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at 
       FROM agent_configs WHERE soul_id = ? ORDER BY created_at DESC`, [soulId]);
    }
    static findAll() {
        return (0, database_1.allQuery)(`SELECT id, user_id, soul_id, agent_name, config_data, status, created_at, updated_at, expires_at 
       FROM agent_configs ORDER BY created_at DESC`);
    }
    static update(id, data) {
        const config = this.findById(id);
        if (!config)
            return undefined;
        const now = new Date().toISOString();
        const updates = [];
        const values = [];
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
        if (updates.length === 0)
            return config;
        updates.push('updated_at = ?');
        values.push(now);
        values.push(id);
        (0, database_1.runQuery)(`UPDATE agent_configs SET ${updates.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }
    static updateStatus(id, status) {
        return this.update(id, { status });
    }
    static delete(id) {
        const result = (0, database_1.runQuery)(`DELETE FROM agent_configs WHERE id = ?`, [id]);
        return result.changes > 0;
    }
    static getConfigData(id) {
        const config = this.findById(id);
        if (!config)
            return undefined;
        try {
            return JSON.parse(config.config_data);
        }
        catch {
            return undefined;
        }
    }
    static count() {
        const result = (0, database_1.getQuery)(`SELECT COUNT(*) as count FROM agent_configs`);
        return result?.count || 0;
    }
    static countByStatus(status) {
        const result = (0, database_1.getQuery)(`SELECT COUNT(*) as count FROM agent_configs WHERE status = ?`, [status]);
        return result?.count || 0;
    }
}
exports.AgentConfigModel = AgentConfigModel;
exports.default = AgentConfigModel;
