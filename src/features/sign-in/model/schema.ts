import z from "zod";

export const signInEmailSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInEmail = z.infer<typeof signInEmailSchema>;

// .min(8)
// .regex(
//   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>/?]).{8,}$/,
//   "Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character"
// ),
