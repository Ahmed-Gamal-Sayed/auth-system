import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let db;

export const DB_Connection = async () => {
  try {
    // Establish a connection
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
    });

    console.log("✅ Connected to MySQL server");

    const dbName = process.env.DB_NAME;
    const dbQuery = `SHOW DATABASES LIKE '${dbName}'`;

    // Execute query using async/await
    const [result] = await db.query(dbQuery);

    if (result.length > 0) {
      console.log(`✅ Database '${dbName}' exists.`);
    } else {
      console.log(`❌ Database '${dbName}' does not exist. Creating it now...`);
      await db.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' has been created successfully.`);
    }

    await db.query(`USE ${dbName}`);
    console.log(`✅ [USE] Database '${dbName}'.`);

  } catch (error) {
    console.error("❌ [ERROR] Connection to MySQL database failed:", error.message);
    process.exit(1);
  }
};

export const DB_Close = async () => {
  if (db) {
    await db.end();
    console.log("✅ [STOP] Connection to MySQL Database");
  }
};

export { db };
