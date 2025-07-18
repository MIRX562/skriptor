import { authClient } from "@/lib/auth-client";
import { SignInEmail } from "./schema";

export async function signInEmail(formData: SignInEmail) {
  const { data, error } = await authClient.signIn.email(
    {
      email: formData.email,
      password: formData.password,
      callbackURL: "/dashboard",
    },
    {}
  );
  if (error) {
    throw new Error(error.message);
  }
  if (data) {
    return data;
  }
  throw new Error("Unknown error occurred during sign in.");
}

export async function signInGoogle() {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: "/dashboard",
  });
}
