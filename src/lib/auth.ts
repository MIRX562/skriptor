import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import { sendEmail } from "./email";
import VerificationEmail from "@/features/verify-email/ui/email-template";
import { redis } from "./redis";
import { account, session, user, verification } from "@/db/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  appName: "Skriptor",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      account,
      session,
      verification,
    },
  }),
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get(key);
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, "EX", ttl);
      else await redis.set(key, value);
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        from: "Skriptor <skriptor@mirx.my.id>",
        to: user.email,
        subject: "Verify your email address",
        react: VerificationEmail({
          userEmail: user.email,
          username: user.name,
          verificationUrl: `${url}dashboard`,
        }),
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: process.env.BETTER_AUTH_URL + "/api/auth/callback/google",
    },
  },
  plugins: [nextCookies()],
});
