import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

import {
    sendPasswordResetEmail,
    sendResetSuccessEmail,
    sendVerificationEmail,
    sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { setNewUser, getUser, updateUser, findUserByResetToken, findUserByVerifiy, setLastLogin, setisVerified } from "../database/UserTable.js";

dotenv.config();


const generateTokenAndSetCookie = (res, userId) => {
    const token = jwt.sign({ userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return token;
};

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.log("Error in verifyToken ", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        if (!email || !password || !fullname) {
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await getUser('email', email);
        // console.log("userAlreadyExists", userAlreadyExists);

        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const hashedPassword = await hashPassword(password);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const generateToken = () => crypto.randomBytes(32).toString("hex");

        const userData = {
            fullname,
            email,
            password: hashedPassword,
            resetPasswordToken: generateToken(),
            resetPasswordExpiresAt: new Date(Date.now() + 3600000),
            verificationToken,
            verificationTokenExpiresAt: new Date(Date.now() + 3600000),
        };

        setNewUser(userData).then((response) => console.log(response));
        await setLastLogin(email);
        await setisVerified(1, email);
        const user = await getUser('email', email);

        generateTokenAndSetCookie(res, user.id);
        await sendVerificationEmail(email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                fullname: user.fullname,
                email: user.email,
                password: undefined,
                lastLogin: user.lastLogin,
                isVerified: user.isVerified,
                role: user.role,
                status: user.status,
            },
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    const { code } = req.body;
    try {
        const user = await findUserByVerifiy(code);

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
        }
        await setisVerified(1, user.email);
        await updateUser('verificationToken', undefined, user.email);
        await updateUser('verificationTokenExpiresAt', undefined, user.email);
        await sendWelcomeEmail(user.email, user.fullname);

        res.status(201).json({
            success: true,
            message: "Verifications Email successfully...",
            user: {
                fullname: user.fullname,
                email: user.email,
                password: undefined,
                lastLogin: user.lastLogin,
                isVerified: user.isVerified,
                role: user.role,
                status: user.status,
            },
        });
    } catch (error) {
        console.log("error in verifyEmail ", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const selectUser = await getUser('email', email);
        if (!selectUser) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        const isPasswordValid = await comparePassword(password, selectUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        generateTokenAndSetCookie(res, selectUser.id);
        const lLogin = await setLastLogin(email);
        if (!lLogin) {
            console.log('last login is not update');
        }

        const verify = await setisVerified(1, email);
        if (!verify) {
            console.log('is verify not update');
        }

        const user = await getUser('email', email);
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        res.status(201).json({
            success: true,
            message: "logging in successfull...",
            user: {
                fullname: user.fullname,
                email: user.email,
                password: undefined,
                lastLogin: user.lastLogin,
                isVerified: user.isVerified,
                role: user.role,
                status: user.status,
            },
        });
    } catch (error) {
        console.log("Error in login ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    const { email } = req.body;

    await setisVerified(0, email);
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await getUser('email', email);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
        await updateUser('resetPasswordToken', resetToken, email);
        await updateUser('resetPasswordExpiresAt', resetTokenExpiresAt, email)
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

        res.status(200).json({ success: true, message: "Password reset link sent to your email" });
    } catch (error) {
        console.log("Error in forgotPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await findUserByResetToken(token);
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
        }

        const hashPassword = await hashPassword(password);

        await updateUser('password', hashPassword, user.email);
        await updateUser('resetPasswordToken', undefined, user.email);
        await updateUser('resetPasswordExpiresAt', undefined, user.email);
        await sendResetSuccessEmail(user.email);

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (error) {
        console.log("Error in resetPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

export const checkAuth = async (req, res) => {
    try {
        const user = await getUser('id', req.userId);
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.log("Error in checkAuth ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};
