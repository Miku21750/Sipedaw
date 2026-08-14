import { beforeEach, describe, expect, it } from "vitest";
import { decryptNik, encryptNik, hashNik, nikStorage } from "@/lib/nik-crypto";

describe("NIK encryption", () => {
  beforeEach(() => {
    process.env.NIK_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
    process.env.NIK_HASH_SECRET = "test-hash-secret-that-is-longer-than-32-characters";
  });
  it("encrypts and decrypts without storing plaintext", () => {
    const encrypted = encryptNik("3273010101010001");
    expect(encrypted).not.toContain("3273010101010001");
    expect(decryptNik(encrypted)).toBe("3273010101010001");
  });
  it("creates a stable lookup hash and masked suffix", () => {
    expect(hashNik("3273010101010001")).toBe(hashNik("3273010101010001"));
    expect(nikStorage("3273010101010001").nikLastFour).toBe("0001");
  });
});
