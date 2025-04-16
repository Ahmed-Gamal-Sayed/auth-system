import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";
import {
  createUser,
  getUserByEmail,
  updateUser,
  getUserById,
  findUserByResetToken,
} from "../database/UserTable.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { validateUserInput } from "../utils/filter.js";

dotenv.config();

const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

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
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized - invalid token" });

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("Error in verifyToken ", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper Functions
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const hashPassword = async (password) => await bcrypt.hash(password, 10);

const comparePassword = async (password, hashedPassword) =>
  await bcrypt.compare(password, hashedPassword);

// 🏆 Signup User
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (email.lenght > 255 || password.lenght > 255 || fullName.lenght > 50) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are not validates" });
    }

    const userFullName = validateUserInput('string', fullName);
    const userEmail = validateUserInput('email', email);
    const userPassword = validateUserInput('password', password);

    const existingUser = await getUserByEmail(userEmail);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await hashPassword(userPassword);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newUser = await createUser({
      fullName: userFullName,
      email: userEmail,
      password: hashedPassword,
      verificationCode,
      verificationExpiresAt: new Date(Date.now() + 3600000), // 1 hour
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🏆 Signin User
export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email);

    if (!user || !(await comparePassword(password, user.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    res.cookie("token", token, { httpOnly: true, secure: true });
    await updateUser(user.email, { lastLogin: Date.now() });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🏆 Signout User
export const signout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// 🏆 Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await getUserByEmail(email);
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    await updateUser(email, {
      resetToken,
      resetExpiresAt: Date.now() + 3600000,
    });
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🏆 Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await findUserByResetToken(token);
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    const hashedPassword = await hashPassword(password);
    await updateUser(user.email, {
      password: hashedPassword,
      resetPasswordToken: null,
    });
    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await getUser("id", req.userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in checkAuth ", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await findUserByVerifiy(code);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }
    await setisVerified(1, user.email);
    await updateUser("verificationToken", undefined, user.email);
    await updateUser("verificationTokenExpiresAt", undefined, user.email);
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
