"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
class UserModel {
    static create(email, name) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        (0, database_1.runQuery)(`INSERT INTO users (id, email, name, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?)`, [id, email, name || null, now, now]);
        return {
            id,
            email,
            name,
            created_at: now,
            updated_at: now,
        };
    }
    static findById(id) {
        return (0, database_1.getQuery)(`SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?`, [id]);
    }
    static findByEmail(email) {
        return (0, database_1.getQuery)(`SELECT id, email, name, created_at, updated_at FROM users WHERE email = ?`, [email]);
    }
    static findAll() {
        return (0, database_1.allQuery)(`SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC`);
    }
    static update(id, data) {
        const user = this.findById(id);
        if (!user)
            return undefined;
        const now = new Date().toISOString();
        const updates = [];
        const values = [];
        if (data.email !== undefined) {
            updates.push('email = ?');
            values.push(data.email);
        }
        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (updates.length === 0)
            return user;
        updates.push('updated_at = ?');
        values.push(now);
        values.push(id);
        (0, database_1.runQuery)(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        return this.findById(id);
    }
    static delete(id) {
        const result = (0, database_1.runQuery)(`DELETE FROM users WHERE id = ?`, [id]);
        return result.changes > 0;
    }
    static count() {
        const result = (0, database_1.getQuery)(`SELECT COUNT(*) as count FROM users`);
        return result?.count || 0;
    }
}
exports.UserModel = UserModel;
exports.default = UserModel;
