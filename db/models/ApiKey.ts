import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { getQuery, allQuery, runQuery } from '../database';

export interface ApiKey {
  id: string;
  user_id: string;
  key_hash: string;
  name?: string;
  last_used?: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

export class ApiKeyModel {
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  static create(userId: string, name?: string, expiresAt?: Date): { key: string; apiKey: ApiKey } {
    const id = uuidv4();
    const key = this.generateKey();
    const keyHash = this.hashKey(key);
    const now = new Date().toISOString();
    
    // Default expiration: 12 hours from now
    const defaultExpiry = expiresAt || new Date(Date.now() + 12 * 60 * 60 * 1000);

    runQuery(
      `INSERT INTO api_keys (id, user_id, key_hash, name, created_at, expires_at, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, keyHash, name || null, now, defaultExpiry.toISOString(), 1]
    );

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

  static findById(id: string): ApiKey | undefined {
    return getQuery(
      `SELECT id, user_id, key_hash, name, last_used, created_at, expires_at, is_active 
       FROM api_keys WHERE id = ?`,
      [id]
    );
  }

  static findByKeyHash(keyHash: string): ApiKey | undefined {
    return getQuery(
      `SELECT id, user_id, key_hash, name, last_used, created_at, expires_at, is_active 
       FROM api_keys WHERE key_hash = ? AND is_active = 1`,
      [keyHash]
    );
  }

  static findByKey(key: string): ApiKey | undefined {
    const keyHash = this.hashKey(key);
    return this.findByKeyHash(keyHash);
  }

  static findByUserId(userId: string): ApiKey[] {
    return allQuery(
      `SELECT id, user_id, key_hash, name, last_used, created_at, expires_at, is_active 
       FROM api_keys WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
  }

  static updateLastUsed(id: string): void {
    const now = new Date().toISOString();
    runQuery(`UPDATE api_keys SET last_used = ? WHERE id = ?`, [now, id]);
  }

  static revoke(id: string): boolean {
    const result = runQuery(`UPDATE api_keys SET is_active = 0 WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  static delete(id: string): boolean {
    const result = runQuery(`DELETE FROM api_keys WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  static isValid(key: string): boolean {
    const apiKey = this.findByKey(key);
    if (!apiKey) return false;
    if (!apiKey.is_active) return false;
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) return false;
    return true;
  }

  static validateAndUpdate(key: string): ApiKey | undefined {
    const apiKey = this.findByKey(key);
    if (!apiKey) return undefined;
    if (!apiKey.is_active) return undefined;
    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) return undefined;

    this.updateLastUsed(apiKey.id);
    return apiKey;
  }

  static count(): number {
    const result = getQuery(`SELECT COUNT(*) as count FROM api_keys WHERE is_active = 1`);
    return result?.count || 0;
  }
}

export default ApiKeyModel;
