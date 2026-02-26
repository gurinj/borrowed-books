import { signIn } from "@/lib/auth";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-sm mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-slate-900">BookShelf</h1>
              <p className="text-sm text-slate-500 mt-1">
                Company book library
              </p>
            </div>
          </div>

          {/* Sign in */}
          <form
            action={async () => {
              "use server";
              await signIn("keycloak", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-2.5 px-4 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Sign in with company account
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Use your company SSO credentials to sign in
          </p>
        </div>
      </div>
    </div>
  );
}
