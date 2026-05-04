import { PasswordForm } from "./password-form";

export default function PasswordPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Security Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Update your password and manage your account security
        </p>
      </div>

      <PasswordForm />
    </div>
  );
}
