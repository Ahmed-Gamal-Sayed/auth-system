import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter
export const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

export const sender = {
    email: "mailtrap@demomailtrap.com",
    name: "Ahmed",
};
