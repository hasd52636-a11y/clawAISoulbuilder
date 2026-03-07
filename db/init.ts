import { getDatabase, closeDatabase } from './database';
import { UserModel } from './models/User';
import { ApiKeyModel } from './models/ApiKey';

/**
 * Initialize database with demo data
 */
export function initializeDemoData(): void {
  try {
    // Create demo user
    const demoUser = UserModel.create('demo@clawnexus.io', 'Demo User');
    console.log('✓ Created demo user:', demoUser.id);

    // Create demo API key
    const { key, apiKey } = ApiKeyModel.create(demoUser.id, 'Demo Key');
    console.log('✓ Created demo API key:', apiKey.id);
    console.log('  Key (save this): demo-key-123');

    // Store demo key in environment for development
    process.env.DEMO_API_KEY = 'demo-key-123';
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('✓ Demo data already exists');
    } else {
      throw error;
    }
  }
}

/**
 * Reset database (development only)
 */
export function resetDatabase(): void {
  const db = getDatabase();

  // Drop all tables
  db.exec(`
    DROP TABLE IF EXISTS deployments;
    DROP TABLE IF EXISTS agent_configs;
    DROP TABLE IF EXISTS api_keys;
    DROP TABLE IF EXISTS users;
  `);

  console.log('✓ Database reset');

  // Reinitialize schema
  const database = getDatabase();
  database.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      key_hash TEXT UNIQUE NOT NULL,
      name TEXT,
      last_used DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE agent_configs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      soul_id TEXT NOT NULL,
      agent_name TEXT NOT NULL,
      config_data TEXT NOT NULL,
      status TEXT DEFAULT 'ready_for_deployment',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE deployments (
      id TEXT PRIMARY KEY,
      config_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      target_system TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      result TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (config_id) REFERENCES agent_configs(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
    CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
    CREATE INDEX idx_agent_configs_user_id ON agent_configs(user_id);
    CREATE INDEX idx_agent_configs_soul_id ON agent_configs(soul_id);
    CREATE INDEX idx_deployments_config_id ON deployments(config_id);
    CREATE INDEX idx_deployments_user_id ON deployments(user_id);
  `);

  console.log('✓ Database schema reinitialized');
}

/**
 * Get database statistics
 */
export function getDatabaseStats(): Record<string, number> {
  const db = getDatabase();

  const stats = {
    users: db.prepare('SELECT COUNT(*) as count FROM users').get() as any,
    api_keys: db.prepare('SELECT COUNT(*) as count FROM api_keys WHERE is_active = 1').get() as any,
    agent_configs: db.prepare('SELECT COUNT(*) as count FROM agent_configs').get() as any,
    deployments: db.prepare('SELECT COUNT(*) as count FROM deployments').get() as any,
  };

  return {
    users: stats.users?.count || 0,
    api_keys: stats.api_keys?.count || 0,
    agent_configs: stats.agent_configs?.count || 0,
    deployments: stats.deployments?.count || 0,
  };
}

export default {
  initializeDemoData,
  resetDatabase,
  getDatabaseStats,
};
