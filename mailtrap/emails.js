import { transporter, sender } from "./mailer.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./mailTemplates.js";

// ✅ Send Verification Email
export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const info = await transporter.sendMail({
      from: `${sender.name} <${sender.email}>`, // ✅ Fixed
      to: email, // ✅ Fixed
      subject: "Verify your email",
      text: `Use this code to verify your email: ${verificationToken}`, // ✅ Added plain text
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
      headers: { "X-Category": "Email Verification" }, // ✅ Alternative for category
    });

    console.log(`✅ [SUCCESS] Email sent successfully! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ [ERROR] sending verification email`, error);
    throw new Error(`❌ [ERROR] sending verification email: ${error.message}`);
  }
};

// ✅ Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  try {
    const info = await transporter.sendMail({
      from: `${sender.name} <${sender.email}>`, // ✅ Fixed
      to: email, // ✅ Fixed
      subject: "Welcome to Our Service!",
      text: `Hello ${name}, welcome to our service!`,
      template_uuid: "e65925d1-a9d1-4a40-ae7c-d92b37d593df", // ✅ Ensure template exists
      template_variables: { company_info_name: "Auth Company", name: name },
    });

    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ [ERROR] sending welcome email`, error);
    throw new Error(`❌ [ERROR] sending welcome email: ${error.message}`);
  }
};

// ✅ Send Password Reset Email
export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const info = await transporter.sendMail({
      from: `${sender.name} <${sender.email}>`, // ✅ Fixed
      to: email, // ✅ Fixed
      subject: "Reset your password",
      text: `Click the following link to reset your password: ${resetURL}`, // ✅ Added plain text
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      headers: { "X-Category": "Password Reset" }, // ✅ Alternative for category
    });

    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ [ERROR] sending password reset email`, error);
    throw new Error(`❌ [ERROR] sending password reset email: ${error.message}`);
  }
};

// ✅ Send Password Reset Success Email
export const sendResetSuccessEmail = async (email) => {
  try {
    const info = await transporter.sendMail({
      from: `${sender.name} <${sender.email}>`, // ✅ Fixed
      to: email, // ✅ Fixed
      subject: "Password Reset Successful",
      text: "Your password has been successfully reset.", // ✅ Added plain text
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      headers: { "X-Category": "Password Reset" }, // ✅ Alternative for category
    });

    console.log(`✅ Password reset email sent successfully! Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ [ERROR] sending password reset success email`, error);
    throw new Error(`❌ [ERROR] sending password reset success email: ${error.message}`);
  }
};
