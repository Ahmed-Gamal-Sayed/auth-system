import { db } from "./db.js";

const tableName = "users";

export const checkUserTable = async () => {
    try {
        // Check if the 'users' table exists
        const query = `SHOW TABLES LIKE '${tableName}'`;
        const [rows] = await db.query(query);

        if (rows.length > 0) {
            console.log(`✅ Table '${tableName}' exists. Using it.`);
        } else {
            console.log(`❌ Table '${tableName}' does not exist. Creating it now...`);

            // SQL Query to create 'users' table
            const createTableQuery = `
                CREATE TABLE users (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    fullname VARCHAR(50) NOT NULL,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP,
                    isVerified TINYINT(1) DEFAULT 0,
                    resetPasswordToken VARCHAR(255) NOT NULL UNIQUE,
                    resetPasswordExpiresAt DATETIME,
                    verificationToken VARCHAR(6),
                    verificationTokenExpiresAt DATETIME,
                    role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
                    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                );
            `;

            // Execute the create table query
            await db.query(createTableQuery);
            console.log(`✅ Table '${tableName}' has been created successfully.`);
        }
    } catch (error) {
        console.error("❌ Error checking or creating table:", error.message);
    }
};

export const setNewUser = async (userData) => {
    const query = `
        INSERT INTO users (
            fullname,
            email,
            password,
            resetPasswordToken,
            resetPasswordExpiresAt,
            verificationToken,
            verificationTokenExpiresAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await db.execute(query, [
            userData.fullname,
            userData.email,
            userData.password,
            userData.resetPasswordToken,
            userData.resetPasswordExpiresAt,
            userData.verificationToken,
            userData.verificationTokenExpiresAt,
        ]);

        console.log('✅ User inserted with ID:', result.insertId);
        return result.length > 0 ? true : false;
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return { success: false, message: "❌ رمز إعادة تعيين كلمة المرور مستخدم بالفعل، يرجى المحاولة مرة أخرى!" };
        }
        console.error("❌ Error inserting user:", error.message);
        throw error;
    }
};

export const getUser = async (colName, newValue) => {
    const allCol = [
        "id",
        "fullname",
        "email",
        "password",
        "lastLogin",
        "isVerified",
        "verificationToken",
        "verificationTokenExpiresAt",
        "resetPasswordToken",
        "resetPasswordExpiresAt",
        "status",
        "role"
    ];

    if (!allCol.includes(colName)) { throw new Error(`❌ Invalid column name: ${colName}`); }

    const query = `SELECT * FROM users WHERE ${colName} = ? LIMIT 1`;

    try {
        const [rows] = await db.execute(query, [newValue]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error selecting user:', error.message);
        throw error;
    }
};

export const updateUser = async (colName, newValue, email) => {
    try {
        const allCol = [
            "fullname",
            "password",
            "lastLogin",
            "isVerified",
            "verificationToken",
            "verificationTokenExpiresAt",
            "resetPasswordToken",
            "resetPasswordExpiresAt",
            "status",
            "role"
        ];

        if (!allCol.includes(colName)) { throw new Error(`❌ Invalid column name: ${colName}`); }

        const query = `UPDATE users SET ${colName} = ? WHERE email = ?`;
        const [result] = await db.execute(query, [newValue, email]);
        return result.affectedRows === 0 ? true : false;
    } catch (error) {
        console.error("❌ Error updating column:", error.message);
        throw error;
    }
};

export const setLastLogin = async (email) => {
    try {
        const query = `UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE email = ?`;
        const [result] = await db.execute(query, [email]);
        return result.affectedRows === 0 ? true : false;
    } catch (error) {
        console.error("❌ Error updating column:", error.message);
        throw error;
    }
};

export const setisVerified = async (newValue, email) => {
    try {
        const query = `UPDATE users SET isVerified = ? WHERE email = ?`;
        const [result] = await db.execute(query, [newValue, email]);
        return result.affectedRows === 0 ? true : false;
    } catch (error) {
        console.error("❌ Error updating column:", error.message);
        throw error;
    }
};

export const findUserByResetToken = async (token) => {
    const query = `
        SELECT * FROM users 
        WHERE resetPasswordToken = ? 
        AND resetPasswordExpiresAt > NOW();
        LIMIT 1
    `;

    try {
        const [rows] = await db.execute(query, [token]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("❌ Error fetching user:", error.message);
        throw error;
    }
};

export const findUserByVerifiy = async (code) => {
    const query = `
        SELECT * FROM users 
        WHERE verificationToken = ? 
        AND verificationTokenExpiresAt > NOW();
        LIMIT 1
    `;

    try {
        const [rows] = await db.execute(query, [code]);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("❌ Error fetching user:", error.message);
        throw error;
    }
};
