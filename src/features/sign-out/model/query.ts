import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export async function SignOut() {
  await authClient.signOut();
  redirect("/");
}
