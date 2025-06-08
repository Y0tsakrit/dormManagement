import { prisma } from "../lib/prisma";

export async function createPayment(data: any) {
  const payment = await prisma.payment.create({
    data,
  });
  return payment;
}

export async function getAllPayments() {
  const payments = await prisma.payment.findMany();
  return payments;
}

export async function getPaymentById(id: string) {
  const payment = await prisma.payment.findUnique({
    where: { id },
  });
  return payment;
}

export async function getPaymentsByUser(userId: string) {
  const payments = await prisma.payment.findMany({
    where: { 
      userId: { 
        has: userId
      }
    },
  });
  return payments;
}

export async function updatePayment(id: string, data: any) {
  const payment = await prisma.payment.update({
    where: { id },
    data,
  });
  return payment;
}

export async function deletePayment(id: string) {
  const payment = await prisma.payment.delete({
    where: { id },
  });
  return payment;
}