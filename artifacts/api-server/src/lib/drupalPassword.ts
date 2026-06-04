import crypto from "crypto";

const ITOA64 = "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const DRUPAL_HASH_LENGTH = 55;

function base64Encode(buf: Buffer, len: number): string {
  let output = "";
  let i = 0;
  do {
    let value = buf[i++]!;
    output += ITOA64[value & 0x3f];
    if (i < len) value |= buf[i]! << 8;
    output += ITOA64[(value >> 6) & 0x3f];
    if (i++ >= len) break;
    if (i < len) value |= buf[i]! << 16;
    output += ITOA64[(value >> 12) & 0x3f];
    if (i++ >= len) break;
    output += ITOA64[(value >> 18) & 0x3f];
  } while (i < len);
  return output;
}

export function verifyDrupalPassword(password: string, storedHash: string): boolean {
  if (!storedHash.startsWith("$S$")) return false;

  const countLog2 = ITOA64.indexOf(storedHash[3]!);
  if (countLog2 < 0) return false;

  const salt = storedHash.substring(4, 12);
  const count = 1 << countLog2;

  const pwBuf = Buffer.from(password, "utf8");
  let hash = crypto.createHash("sha512").update(salt).update(pwBuf).digest();

  let i = count;
  do {
    hash = crypto.createHash("sha512").update(hash).update(pwBuf).digest();
  } while (--i);

  const setting = storedHash.substring(0, 12);
  const computed = (setting + base64Encode(hash, 64)).substring(0, DRUPAL_HASH_LENGTH);
  const stored = storedHash.substring(0, DRUPAL_HASH_LENGTH);

  return computed === stored;
}
