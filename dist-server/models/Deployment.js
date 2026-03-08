"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentModel = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
class DeploymentModel {
    static create(configId, userId, targetSystem) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        (0, database_1.runQuery)(`INSERT INTO deployments (id, config_id, user_id, target_system, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, configId, userId, targetSystem, 'pending', now, now]);
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
    static findById(id) {
        return (0, database_1.getQuery)(`SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE id = ?`, [id]);
    }
    static findByConfigId(configId) {
        return (0, database_1.allQuery)(`SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE config_id = ? ORDER BY created_at DESC`, [configId]);
    }
    static findByUserId(userId) {
        return (0, database_1.allQuery)(`SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
    }
    static findByStatus(status) {
        return (0, database_1.allQuery)(`SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE status = ? ORDER BY created_at DESC`, [status]);
    }
    static findAll() {
        return (0, database_1.allQuery)(`SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments ORDER BY created_at DESC`);
    }
    static update(id, data) {
        const deployment = this.findById(id);
        if (!deployment)
            return undefined;
        const now = new Date().toISOString();
        const updates = [];
        const values = [];
        if (data.status !== undefined) {
            updates.push('status = ?');
            values.push(data.status);
        }
        if (data.result !== undefined) {
            updates.push('result = ?');
            values.push(typeof data.result === 'string' ? data.result : JSON.stringify(data.result));
        }
        if (updates.length === 0)
            return deployment;
        updates.push('updated_at = ?');
        values.push(now);
        values.push(id);
        (0, database_1.runQuery)(`UPDATE deployments SET ${updates.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }
    static updateStatus(id, status, result) {
        return this.update(id, {
            status,
            result: result ? JSON.stringify(result) : undefined,
        });
    }
    static delete(id) {
        const result = (0, database_1.runQuery)(`DELETE FROM deployments WHERE id = ?`, [id]);
        return result.changes > 0;
    }
    static getResult(id) {
        const deployment = this.findById(id);
        if (!deployment || !deployment.result)
            return undefined;
        try {
            return JSON.parse(deployment.result);
        }
        catch {
            return deployment.result;
        }
    }
    static count() {
        const result = (0, database_1.getQuery)(`SELECT COUNT(*) as count FROM deployments`);
        return result?.count || 0;
    }
    static countByStatus(status) {
        const result = (0, database_1.getQuery)(`SELECT COUNT(*) as count FROM deployments WHERE status = ?`, [status]);
        return result?.count || 0;
    }
    static getLatestByConfigId(configId) {
        return (0, database_1.getQuery)(`SELECT id, config_id, user_id, target_system, status, result, created_at, updated_at 
       FROM deployments WHERE config_id = ? ORDER BY created_at DESC LIMIT 1`, [configId]);
    }
}
exports.DeploymentModel = DeploymentModel;
exports.default = DeploymentModel;
