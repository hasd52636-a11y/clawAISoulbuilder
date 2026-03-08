"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
exports.runQuery = runQuery;
exports.getQuery = getQuery;
exports.allQuery = allQuery;
exports.transaction = transaction;
const better_sqlite3_1 = require("better-sqlite3");
const path_1 = require("path");
const fs_1 = require("fs");
// Database configuration
const DB_DIR = path_1.default.join(process.env.HOME || process.env.USERPROFILE || '.', '.openclaw', 'data');
const DB_PATH = path_1.default.join(DB_DIR, 'clawnexus.db');
// Ensure database directory exists
if (!fs_1.default.existsSync(DB_DIR)) {
    fs_1.default.mkdirSync(DB_DIR, { recursive: true });
}
// Initialize database connection
let db = null;
function getDatabase() {
    if (!db) {
        db = new better_sqlite3_1.default(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        initializeSchema();
    }
    return db;
}
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}
// Initialize database schema
function initializeSchema() {
    const database = db;
    // Users table
    database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // API Keys table
    database.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      key_hash TEXT UNIQUE NOT NULL,
      name TEXT,
      last_used DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    // Agent Configurations table
    database.exec(`
    CREATE TABLE IF NOT EXISTS agent_configs (
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
    )
  `);
    // Deployments table
    database.exec(`
    CREATE TABLE IF NOT EXISTS deployments (
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
    )
  `);
    // Create indexes for better performance
    database.exec(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
    CREATE INDEX IF NOT EXISTS idx_agent_configs_user_id ON agent_configs(user_id);
    CREATE INDEX IF NOT EXISTS idx_agent_configs_soul_id ON agent_configs(soul_id);
    CREATE INDEX IF NOT EXISTS idx_deployments_config_id ON deployments(config_id);
    CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
  `);
}
// Helper functions for common operations
function runQuery(sql, params = []) {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.run(...params);
}
function getQuery(sql, params = []) {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.get(...params);
}
function allQuery(sql, params = []) {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.all(...params);
}
// Transaction support
function transaction(fn) {
    const database = getDatabase();
    const trans = database.transaction(fn);
    return trans();
}
exports.default = getDatabase;
