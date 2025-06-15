import { prisma } from "../lib/prisma";

export async function createBooking(data: any) {
  const booking = await prisma.booking.create({
    data,
  });
  return booking;
}

export async function getAllBookings() {
  const bookings = await prisma.booking.findMany();
  return bookings;
}

export async function getBookingById(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });
  return booking;
}

export async function getBookingsByUser(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: { userId },
  });
  return bookings;
}

export async function getBookingsByRoom(roomId: string) {
  const bookings = await prisma.booking.findMany({
    where: { roomId },
  });
  return bookings;
}

export async function updateBooking(id: string, data: any) {
  const booking = await prisma.booking.update({
    where: { id },
    data,
  });
  return booking;
}

export async function deleteBooking(id: string) {
  const booking = await prisma.booking.delete({
    where: { id },
  });
  return booking;
}

export async function getActiveBookings() {
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      startTime: { lte: now },
      endTime: { gte: now }
    }
  });
  return bookings;
}

export async function getUpcomingBookings(userId?: string) {
  const now = new Date();
  const bookings = await prisma.booking.findMany({
    where: {
      startTime: { gt: now },
      ...(userId && { userId })
    },
    orderBy: { startTime: 'asc' }
  });
  return bookings;
}