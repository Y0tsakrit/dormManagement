import { prisma } from "../lib/prisma";

export async function createFixRequest(data: any) {
  const fixRequest = await prisma.fixRequest.create({
    data,
  });
  return fixRequest;
}

export async function getAllFixRequests() {
  const fixRequests = await prisma.fixRequest.findMany();
  return fixRequests;
}

export async function getFixRequestById(id: string) {
  const fixRequest = await prisma.fixRequest.findUnique({
    where: { id },
  });
  return fixRequest;
}

export async function updateFixRequest(id: string, data: any) {
  const fixRequest = await prisma.fixRequest.update({
    where: { id },
    data,
  });
  return fixRequest;
}

export async function deleteFixRequest(id: string) {
  const fixRequest = await prisma.fixRequest.delete({
    where: { id },
  });
  return fixRequest;
}