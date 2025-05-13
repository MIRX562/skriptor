import { ProfileForm } from "./profile-form";

export default function ProfilePage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your personal information and how it appears across Whisper
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
