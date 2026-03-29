import "server-only";

import crypto from "crypto";

export function generateNumericOtp(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i += 1) {
    otp += crypto.randomInt(0, 10).toString();
  }
  return otp;
}

export function generateToken(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}

export function hashToken(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function expiryFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}
