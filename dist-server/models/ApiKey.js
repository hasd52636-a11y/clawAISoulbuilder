"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyModel = void 0;
const uuid_1 = require("uuid");
const crypto_1 = require("crypto");
const database_1 = require("../database");
class ApiKeyModel {
    static generateKey() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    static hashKey(key) {
        return crypto_1.default.createHash('sha256').update(key).digest('hex');
    }
    static create(userId, name, expiresAt) {
        const id = (0, uuid_1.v4)();
        const key = this.generateKey();
        const keyHash = this.hashKey(key);
        const now = new Date().toISOString();
        // Default expiration: 12 hours from now
        const defaultExpiry = expiresAt || new Date(Date.now() + 12 * 60 * 60 * 1000);
        (0, database_1.runQuery)(`INSERT INTO api_keys (id, user_id, key_hash, name, created_at, expires_at, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, userId, keyHash, name || null, now, defaultExpiry.toISOString(), 1]);
        return {
            key,
            apiKey: {
                id,
                user_id: userId,
                key_hash: keyHash,
                name,
                created_at: now,
                expires_at: defaultExpiry.toISOString(),
                is_active: true,
            },
        };
    }
    static findById(id) {
        return (0, database_1.getQuery)(`SELECT id, user_id, key_hash, name, last_used, created_at, expires_at, is_active 
       FROM api_keys WHERE id = ?`, [id]);
    }
    static findByKeyHash(keyHash) {
        return (0, database_1.getQuery)(`SELECT id, user_id, key_hash, name, last_used, created_at, expires_at, is_active 
       FROM api_keys WHERE key_hash = ? AND is_active = 1`, [keyHash]);
    }
    static findByKey(key) {
        const keyHash = this.hashKey(key);
        return this.findByKeyHash(keyHash);
    }
    static findByUserId(userId) {
        return (0, database_1.allQuery)(`SELECT id, user_id, key_hash, name, last_used, created_at, expires_at, is_active 
       FROM api_keys WHERE user_id = ? ORDER BY created_at DESC`, [userId]);
    }
    static updateLastUsed(id) {
        const now = new Date().toISOString();
        (0, database_1.runQuery)(`UPDATE api_keys SET last_used = ? WHERE id = ?`, [now, id]);
    }
    static revoke(id) {
        const result = (0, database_1.runQuery)(`UPDATE api_keys SET is_active = 0 WHERE id = ?`, [id]);
        return result.changes > 0;
    }
    static delete(id) {
        const result = (0, database_1.runQuery)(`DELETE FROM api_keys WHERE id = ?`, [id]);
        return result.changes > 0;
    }
    static isValid(key) {
        const apiKey = this.findByKey(key);
        if (!apiKey)
            return false;
        if (!apiKey.is_active)
            return false;
        if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date())
            return false;
        return true;
    }
    static validateAndUpdate(key) {
        const apiKey = this.findByKey(key);
        if (!apiKey)
            return undefined;
        if (!apiKey.is_active)
            return undefined;
        if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date())
            return undefined;
        this.updateLastUsed(apiKey.id);
        return apiKey;
    }
    static count() {
        const result = (0, database_1.getQuery)(`SELECT COUNT(*) as count FROM api_keys WHERE is_active = 1`);
        return result?.count || 0;
    }
}
exports.ApiKeyModel = ApiKeyModel;
exports.default = ApiKeyModel;
