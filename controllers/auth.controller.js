import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";
import {
  createUser,
  getUserByEmail,
  updateUser,
  getUserById,
} from "../database/UserTable.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";

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

// 🏆 Register User
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const newUser = await createUser({
      fullName,
      email,
      password: hashedPassword,
      verificationCode,
      verificationExpiresAt: new Date(Date.now() + 3600000), // 1 hour
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
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

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const selectUser = await getUser("email", email);
    if (!selectUser) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const isPasswordValid = await comparePassword(
      password,
      selectUser.password
    );
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    generateTokenAndSetCookie(res, selectUser.id);
    const lLogin = await setLastLogin(email);
    if (!lLogin) {
      console.log("last login is not update");
    }

    const verify = await setisVerified(1, email);
    if (!verify) {
      console.log("is verify not update");
    }

    const user = await getUser("email", email);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
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

// 🏆 Logout User
export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
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
    const user = await getUser("email", email);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
    await updateUser("resetPasswordToken", resetToken, email);
    await updateUser("resetPasswordExpiresAt", resetTokenExpiresAt, email);
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
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
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    const hashPassword = await hashPassword(password);

    await updateUser("password", hashPassword, user.email);
    await updateUser("resetPasswordToken", undefined, user.email);
    await updateUser("resetPasswordExpiresAt", undefined, user.email);
    await sendResetSuccessEmail(user.email);

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.log("Error in resetPassword ", error);
    res.status(400).json({ success: false, message: error.message });
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

// 🏆 Login User
export const login = async (req, res) => {
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

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user.id, email: user.email, fullName: user.fullName },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🏆 Logout User
export const logout = (req, res) => {
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
    const { token, newPassword } = req.body;
    const user = await getUserById(token);
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    const hashedPassword = await hashPassword(newPassword);
    await updateUser(user.email, {
      password: hashedPassword,
      resetToken: null,
    });

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
