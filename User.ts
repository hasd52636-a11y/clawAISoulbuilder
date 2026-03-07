import { v4 as uuidv4 } from 'uuid';
import { getQuery, allQuery, runQuery } from '../database';

export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}

export class UserModel {
  static create(email: string, name?: string): User {
    const id = uuidv4();
    const now = new Date().toISOString();

    runQuery(
      `INSERT INTO users (id, email, name, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, email, name || null, now, now]
    );

    return {
      id,
      email,
      name,
      created_at: now,
      updated_at: now,
    };
  }

  static findById(id: string): User | undefined {
    return getQuery(
      `SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?`,
      [id]
    );
  }

  static findByEmail(email: string): User | undefined {
    return getQuery(
      `SELECT id, email, name, created_at, updated_at FROM users WHERE email = ?`,
      [email]
    );
  }

  static findAll(): User[] {
    return allQuery(
      `SELECT id, email, name, created_at, updated_at FROM users ORDER BY created_at DESC`
    );
  }

  static update(id: string, data: Partial<User>): User | undefined {
    const user = this.findById(id);
    if (!user) return undefined;

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }

    if (updates.length === 0) return user;

    updates.push('updated_at = ?');
    values.push(now);
    values.push(id);

    runQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const result = runQuery(`DELETE FROM users WHERE id = ?`, [id]);
    return result.changes > 0;
  }

  static count(): number {
    const result = getQuery(`SELECT COUNT(*) as count FROM users`);
    return result?.count || 0;
  }
}

export default UserModel;
