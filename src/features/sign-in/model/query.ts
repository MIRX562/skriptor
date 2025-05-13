import { authClient } from "@/lib/auth-client";
import { SignInEmail } from "./schema";

export async function signInEmail(formData: SignInEmail) {
  try {
    const { data } = await authClient.signIn.email(
      {
        /**
         * The user email
         */
        email: formData.email,
        /**
         * The user password
         */
        password: formData.password,
        /**
         * A URL to redirect to after the user verifies their email (optional)
         */
        callbackURL: "/dashboard",
      },
      {
        //callbacks
      }
    );
    return data;
  } catch (error) {
    console.error(error);
  }
}
