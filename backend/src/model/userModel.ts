import { prisma } from "../lib/prisma";

export async function createUser(data: any) {
  const user = await prisma.user.create({
    data,
  });
  return user;
}

export async function getAllUsers() {
  const users = await prisma.user.findMany();
  return users;
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user;
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
}

export async function updateUser(id: string, data: any) {
  const user = await prisma.user.update({
    where: { id },
    data,
  });
  return user;
}

export async function deleteUser(id: string) {
  const user = await prisma.user.delete({
    where: { id },
  });
  return user;
}

export async function getUserByPhone(phone: string) {
  const user = await prisma.user.findUnique({
    where: { phone },
  });
  return user;
}