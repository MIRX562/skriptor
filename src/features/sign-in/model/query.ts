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
  // If neither data nor error, throw a generic error
  throw new Error("Unknown error occurred during sign in.");
}
