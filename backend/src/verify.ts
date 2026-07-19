import { initDb, query } from './config/db';

async function testConnection() {
  console.log('Testing database load...');
  try {
    await initDb();
    const students = await query('SELECT id, name, email, role FROM students');
    console.log('Verification Success!');
    console.log('Total students seeded:', students.length);
    console.log('Sample profiles:', students);
    process.exit(0);
  } catch (err) {
    console.error('Verification Failed with database error:', err);
    process.exit(1);
  }
}

testConnection();
