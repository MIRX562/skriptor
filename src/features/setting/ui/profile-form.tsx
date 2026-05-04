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
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  if (!user) return null;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await toast.promise(authClient.updateUser(values), {
        loading: "Updating profile...",
        success: "Profile updated successfully",
        error: (err) => err.message || "Failed to update profile",
      });
    } catch (error) {
      console.error("Profile update error:", error);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 dark:text-slate-200">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your name" 
                          {...field} 
                          className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500 dark:text-slate-400">
                        This is the name that will be displayed on your profile.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-900 dark:text-slate-200">Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your@email.com" 
                          type="email" 
                          {...field} 
                          className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500"
                        />
                      </FormControl>
                      <FormDescription className="text-slate-500 dark:text-slate-400">
                        Your primary email address for notifications and sign-in.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Account Details
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Technical information about your user account.
                </p>
              </div>

              <Separator className="bg-slate-200 dark:bg-slate-800" />

              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                    User ID
                  </span>
                  <code className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-800 dark:text-slate-200 w-fit">
                    {user.id}
                  </code>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                    Created On
                  </span>
                  <p className="text-slate-900 dark:text-white font-medium">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">
                    Email Status
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={user.emailVerified ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-amber-600 dark:text-amber-400 font-medium"}>
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </span>
                    {user.emailVerified && (
                      <div className="h-4 w-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] text-emerald-600 dark:text-emerald-400">
                        ✓
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-red-100 dark:border-red-900/30">
        <CardContent className="p-6">
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
