import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";

function encryptionKey() {
  const encoded = process.env.NIK_ENCRYPTION_KEY;
  if (!encoded) throw new Error("NIK_ENCRYPTION_KEY_NOT_CONFIGURED");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("NIK_ENCRYPTION_KEY_MUST_BE_32_BYTES");
  return key;
}

function hashSecret() {
  const secret = process.env.NIK_HASH_SECRET;
  if (!secret || secret.length < 32) throw new Error("NIK_HASH_SECRET_NOT_CONFIGURED");
  return secret;
}

export function encryptNik(nik: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(nik, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptNik(value: string) {
  const [version, iv, tag, encrypted] = value.split(".");
  if (version !== "v1" || !iv || !tag || !encrypted) throw new Error("INVALID_NIK_CIPHERTEXT");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64url")), decipher.final()]).toString("utf8");
}

export function hashNik(nik: string) {
  return createHmac("sha256", hashSecret()).update(nik).digest("hex");
}

export function nikStorage(nik: string) {
  return { legacyNik: null, nikEncrypted: encryptNik(nik), nikHash: hashNik(nik), nikLastFour: nik.slice(-4) };
}

export function readableNik(input: { nikEncrypted: string | null; legacyNik: string | null }) {
  if (input.nikEncrypted) return decryptNik(input.nikEncrypted);
  if (input.legacyNik) return input.legacyNik.trim();
  throw new Error("NIK_NOT_AVAILABLE");
}
