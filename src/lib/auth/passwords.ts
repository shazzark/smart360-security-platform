import "server-only";
import { argon2id, hash, verify } from "argon2";

export function hashPassword(password: string) {
  return hash(password, { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

export async function verifyPassword(passwordHash: string, password: string) {
  try { return await verify(passwordHash, password); } catch { return false; }
}

let dummyHash: Promise<string> | undefined;
export function getDummyHash() {
  // Unknown accounts still perform password verification without revealing account existence.
  return dummyHash ??= hashPassword("unused-dummy-credential-for-timing");
}
