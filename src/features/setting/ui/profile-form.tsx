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
    <div className="space-y-10 p-6 md:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-900 dark:text-slate-200">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your name" 
                            {...field} 
                            className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl transition-all"
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-slate-500 dark:text-slate-500">
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
                        <FormLabel className="text-sm font-semibold text-slate-900 dark:text-slate-200">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your@email.com" 
                            type="email" 
                            {...field} 
                            className="h-12 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 focus-visible:ring-teal-500 rounded-xl transition-all"
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-slate-500 dark:text-slate-500">
                          Your primary email address for notifications and sign-in.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting || !form.formState.isDirty}
                    className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/20 transition-all active:scale-[0.98]"
                  >
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50 rounded-3xl overflow-hidden shadow-sm">
            <CardContent className="p-8">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Account Details
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    Information about your account.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      User ID
                    </span>
                    <div className="group relative">
                      <code className="block text-xs font-mono bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-slate-700 dark:text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap">
                        {user.id}
                      </code>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Created On
                    </span>
                    <p className="text-sm text-slate-900 dark:text-white font-semibold">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                      Email Status
                    </span>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.emailVerified 
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20" 
                          : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20"
                      }`}>
                        {user.emailVerified ? (
                          <>
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Verified
                          </>
                        ) : (
                          <>
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Unverified
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="bg-red-50/30 dark:bg-red-950/10 border-red-100/50 dark:border-red-900/20 rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-red-900 dark:text-red-400">
                Danger Zone
              </h3>
              <p className="text-sm text-red-700/60 dark:text-red-400/60">
                 Irreversible actions. Once you delete your account, there is no going back.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-11 px-6 rounded-xl font-semibold shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all">
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl border-slate-200 dark:border-slate-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                    This action cannot be undone. This will permanently delete
                    your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-3">
                  <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-800">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => authClient.deleteUser()}
                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
