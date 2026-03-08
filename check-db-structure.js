import { Pool } from 'pg';

// 数据库连接字符串
const connectionString = 'postgres://ffaaea62d79988250b5703b5864e2b1ecd72d6b950d2b9e664cf5811040cf447:sk_CY4M1Lpu1hlp6ZEjZN64D@db.prisma.io:5432/postgres?sslmode=require';

// 创建数据库连接池
const pool = new Pool({ connectionString });

async function checkDatabaseStructure() {
  try {
    // 连接到数据库
    const client = await pool.connect();
    console.log('Connected to database');

    // 检查是否存在 User 表
    const userTableResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'User'
      );
    `);

    if (userTableResult.rows[0].exists) {
      console.log('User table exists');

      // 查看 User 表的结构
      const userTableStructure = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'User'
        ORDER BY ordinal_position;
      `);

      console.log('User table structure:');
      userTableStructure.rows.forEach(row => {
        console.log(`  ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('User table does not exist');
    }

    // 检查所有表
    const allTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nAll tables in database:');
    allTablesResult.rows.forEach(row => {
      console.log(`  ${row.table_name}`);
    });

    // 断开连接
    await client.release();
    await pool.end();
    console.log('\nDisconnected from database');
  } catch (error) {
    console.error('Error checking database structure:', error);
    await pool.end();
  }
}

// 运行检查
checkDatabaseStructure();
