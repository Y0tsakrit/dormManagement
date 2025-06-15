import { prisma } from "../lib/prisma";

export async function createRoom(data: any) {
  const room = await prisma.room.create({
    data,
  });
  return room;
}

export async function getAllRooms() {
  const rooms = await prisma.room.findMany();
  return rooms;
}

export async function getRoomById(id: string) {
  const room = await prisma.room.findUnique({
    where: { id },
  });
  return room;
}

export async function getRoomByUser(userId: string) {
  const rooms = await prisma.room.findMany({
    where: { users: userId },
  });
  return rooms;
}

export async function updateRoom(id: string, data: any) {
  const room = await prisma.room.update({
    where: { id },
    data,
  });
  return room;
}

export async function deleteRoom(id: string) {
  const room = await prisma.room.delete({
    where: { id },
  });
  return room;
}