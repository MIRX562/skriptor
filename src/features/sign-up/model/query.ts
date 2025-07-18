import { authClient } from "@/lib/auth-client"; //import the auth client
import { SignUpEmail } from "./schema";

export async function signUpEmail(value: SignUpEmail) {
  try {
    const { name, email, password } = value;
    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name,
        callbackURL: "/dashboard", // A URL to redirect to after the user verifies their email (optional)
      },
      {
        onRequest: (ctx) => {
          //show loading
        },
        onSuccess: (ctx) => {
          //redirect to the dashboard or sign in page
        },
        onError: (ctx) => {
          // display the error message
          alert(ctx.error.message);
        },
      }
    );
    if (data) {
      return { success: true };
    }
    if (error) {
      throw Error(error.message);
    }
  } catch (error) {
    console.error(error);
  }
}
