import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create User
export async function createUser(userData) {
  try {
    return await prisma.user.create({ data: userData });
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    return null;
  }
}

// Get User by Email
export async function getUserByEmail(email) {
  try {
    return await prisma.user.findUnique({ where: { email } });
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    return null;
  }
}

// Get User by ID
export async function getUserById(id) {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch (error) {
    console.error("❌ Error fetching user:", error.message);
    return null;
  }
}

// 🔹 Get All Users
export async function getAllUsers() {
  try {
    return await prisma.user.findMany();
  } catch (error) {
    console.error("❌ Error fetching all users:", error.message);
    return [];
  }
}

export async function updateUser(email, updates) {
  try {
    return await prisma.user.update({
      where: { email },
      data: updates,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    return null;
  }
}

export async function deleteUser(email) {
  try {
    return await prisma.user.delete({ where: { email } });
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    return null;
  }
}

// 🔹 Find User by Reset Token
export async function findUserByResetToken(token) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: {
          gt: new Date(), // Token must be valid (not expired)
        },
      },
    });
    return user || null;
  } catch (error) {
    console.error("❌ Error fetching user by reset token:", error.message);
    return null;
  }
}

// 🔹 Find User by Verification Code
export async function findUserByVerifiy(code) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: code,
        verificationTokenExpiresAt: {
          gt: new Date(), // Code must be valid (not expired)
        },
      },
    });
    return user || null;
  } catch (error) {
    console.error(
      "❌ Error fetching user by verification code:",
      error.message
    );
    return null;
  }
}

// ✅ Close Prisma Connection After Each Request
process.on("exit", async () => {
  await prisma.$disconnect();
});
