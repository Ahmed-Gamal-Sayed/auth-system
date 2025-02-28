import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 Create a User
export async function CreateUser(userData) {
  try {
    const newUser = await prisma.user.create({
      data: {
        fullName: userData.fullName, // Corrected property case
        email: userData.email,
        password: userData.password,
        gender: userData.gender,
        birthdate: new Date(userData.birthdate),
        age: userData.age,
        image: userData.image,
        phone: userData.phone,
        city: userData.city,
        country: userData.country,
        role: userData.role,
        status: userData.status,
      },
    });
    return newUser ? 1 : 0;
  } catch (error) {
    console.error("❌ Error creating user:", error.message);
    return 0;
  }
}

// 🔹 Get User by ID
export async function getUserById(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    return user || null;
  } catch (error) {
    console.error("❌ Error fetching user by ID:", error.message);
    return null;
  }
}

// 🔹 Get User by Email
export async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    return user || null;
  } catch (error) {
    console.error("❌ Error fetching user by email:", error.message);
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

// 🔹 Update User
export async function updateUser(userId, userData) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: userData.fullName,
        email: userData.email,
        password: userData.password,
        gender: userData.gender,
        birthdate: new Date(userData.birthdate),
        age: userData.age,
        image: userData.image,
        phone: userData.phone,
        city: userData.city,
        country: userData.country,
        role: userData.role,
        status: userData.status,
      },
    });
    return updatedUser ? 1 : 0;
  } catch (error) {
    console.error("❌ Error updating user:", error.message);
    return 0;
  }
}

// 🔹 Delete User
export async function delUser(userId) {
  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
    });
    return deletedUser ? 1 : 0;
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    return 0;
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
