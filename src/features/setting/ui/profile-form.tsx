"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { formatDate } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const { data } = authClient.useSession();
  if (!data) return null;
  const user = data.user;

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      toast.promise(authClient.updateUser(values), {
        loading: "Updating user profile...",
        error: (err) => err.message,
        success: "User Profile updated",
      });
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  }
  return (
    <div className="flex flex-col gap-8">
      <div className="w-full flex gap-8">
        <Card className="w-1/2">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 "
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Placeholder" {...field} />
                      </FormControl>
                      <FormDescription>Change your username.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" type="email" {...field} />
                      </FormControl>
                      <FormDescription>Change your email.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                  Change
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="w-1/2">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Account Information
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Additional information about your account
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-clip font-medium text-slate-500 dark:text-slate-400">
                    Account ID
                  </p>
                  <p className="text-slate-900 dark:text-white">{user.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Member Since
                  </p>
                  <p className="text-slate-900 dark:text-white">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                Danger Zone
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Irreversible and destructive actions
              </p>
            </div>

            <Separator />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Delete Account
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => authClient.deleteUser()}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
