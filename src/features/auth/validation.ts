import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
});

export const otpRequestSchema = z.object({
  email: z.email().toLowerCase(),
});

export const otpVerifySchema = z.object({
  email: z.email().toLowerCase(),
  otp: z.string().trim().length(6),
});

export const passwordResetConfirmSchema = z.object({
  email: z.email().toLowerCase(),
  otp: z.string().trim().length(6),
  password: z.string().min(8).max(128),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
