"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { signUpEmailSchema } from "../model/schema";
import { signUpEmail } from "../model/query";
import { useRouter } from "next/navigation";
import { signInGoogle } from "@/features/sign-in/model/query";

interface SignUpPageProps {
  dict: any;
}

export default function SignUpPage({ dict }: SignUpPageProps) {
  const form = useForm<z.infer<typeof signUpEmailSchema>>({
    resolver: zodResolver(signUpEmailSchema),
  });

  const router = useRouter();

  function onSubmit(values: z.infer<typeof signUpEmailSchema>) {
    try {
      toast.promise(signUpEmail(values), {
        loading: dict.auth.signUp.messages.loading,
        error: dict.auth.signUp.messages.error,
        success: dict.auth.signUp.messages.success,
      });
    } catch (error) {
      console.error("Form submission error", error);
      toast.error(dict.auth.signUp.messages.error);
    }
    router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{dict.auth.signUp.title}</CardTitle>
          <CardDescription>{dict.auth.signUp.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.auth.signUp.name.label}</FormLabel>
                    <FormControl>
                      <Input placeholder={dict.auth.signUp.name.placeholder} {...field} />
                    </FormControl>
                    <FormDescription>{dict.auth.signUp.name.description}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.auth.signUp.email.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={dict.auth.signUp.email.placeholder}
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>{dict.auth.signUp.email.description}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dict.auth.signUp.password.label}</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder={dict.auth.signUp.password.placeholder} {...field} />
                    </FormControl>
                    <FormDescription>{dict.auth.signUp.password.description}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                variant="outline"
                className="w-full bg-teal-500 dark:bg-teal-400 text-primary-foreground"
              >
                {dict.auth.signUp.submit}
              </Button>
            </form>
          </Form>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-4 text-muted-foreground">
              {dict.auth.signUp.divider}
            </span>
          </div>

          <Button
            variant="outline"
            className="w-full bg-teal-500 dark:bg-teal-400 text-primary-foreground"
            onClick={() => signInGoogle()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            {dict.auth.signUp.googleButton}
          </Button>
          <div className="text-center text-sm">
            {dict.auth.signUp.hasAccount}{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              {dict.auth.signUp.signIn}
            </Link>
          </div>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
            {dict.auth.signIn.tosPrefix}{" "}
            <a href="#">{dict.auth.signIn.tos}</a> {dict.auth.signIn.and}{" "}
            <a href="#">{dict.auth.signIn.privacyPolicy}</a>.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
