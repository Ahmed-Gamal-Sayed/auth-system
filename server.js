import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import authRoute from './routes/auth.route.js';
import { DB_Close, DB_Connection } from './database/db.js';
import { checkUserTable } from './database/UserTable.js';


dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({ credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoute);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/public")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "public", "index.html"));
	});
}

app.listen(port, async () => {
	try {
		await DB_Connection();	// Connect Database.
		await checkUserTable();	// Check User Table Exist.
		console.log(`✅ Server started at http://localhost:${port}`);
	} catch (error) {
		await DB_Close();	// Stop Connection Database.
		console.error("❌ Server failed to start:", error.message);
		process.exit(1);
	}
});
