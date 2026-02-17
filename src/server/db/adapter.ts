/**
 * DB adapter: uses Prisma when available, falls back to in-memory mock on connection/auth errors.
 */

import {
  findUserByPhone as prismaFindUserByPhone,
  verifyUserPin as prismaVerifyUserPin,
  createUserWithProfileAndBaselineWeighIn as prismaCreateUser,
  getUserById as prismaGetUserById,
} from "./repositories";
import {
  mockFindUserByPhone,
  mockVerifyUserPin,
  mockCreateUserWithProfileAndBaselineWeighIn,
  mockGetUserById,
} from "./mockStore";

let useMock = false;

function isPrismaConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes("authentication failed") ||
    msg.includes("can't reach database") ||
    msg.includes("connection refused") ||
    msg.includes("p1001") ||
    msg.includes("p1017") ||
    msg.includes("p1002")
  );
}

export async function findUserByPhone(phone: string) {
  if (useMock) return mockFindUserByPhone(phone);
  try {
    return await prismaFindUserByPhone(phone);
  } catch (err) {
    if (isPrismaConnectionError(err)) {
      useMock = true;
      return mockFindUserByPhone(phone);
    }
    throw err;
  }
}

export async function verifyUserPin(phone: string, pin: string) {
  if (useMock) return mockVerifyUserPin(phone, pin);
  try {
    return await prismaVerifyUserPin(phone, pin);
  } catch (err) {
    if (isPrismaConnectionError(err)) {
      useMock = true;
      return mockVerifyUserPin(phone, pin);
    }
    throw err;
  }
}

export async function createUserWithProfileAndBaselineWeighIn(data: Parameters<typeof prismaCreateUser>[0]) {
  if (useMock) return mockCreateUserWithProfileAndBaselineWeighIn(data as Parameters<typeof mockCreateUserWithProfileAndBaselineWeighIn>[0]);
  try {
    return await prismaCreateUser(data);
  } catch (err) {
    if (isPrismaConnectionError(err)) {
      useMock = true;
      return mockCreateUserWithProfileAndBaselineWeighIn(data as Parameters<typeof mockCreateUserWithProfileAndBaselineWeighIn>[0]);
    }
    throw err;
  }
}

export async function getUserById(id: string) {
  if (useMock) return mockGetUserById(id);
  try {
    return await prismaGetUserById(id);
  } catch (err) {
    if (isPrismaConnectionError(err)) {
      useMock = true;
      return mockGetUserById(id);
    }
    throw err;
  }
}
