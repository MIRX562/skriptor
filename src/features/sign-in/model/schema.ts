import z from "zod";

export const signInEmailSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type SignInEmail = z.infer<typeof signInEmailSchema>;
