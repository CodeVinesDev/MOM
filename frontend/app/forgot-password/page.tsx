"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/Button";
import { useToast } from "@/components/useToast";
import Link from "next/link";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });
  const { showToast } = useToast();

  async function onSubmit(values: ForgotForm) {
    try {
      await apiFetch<{ message: string }>("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(values),
      });
      showToast("If that email exists, reset instructions have been sent.", "success");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-md flex-col gap-8 rounded-[2rem] bg-white p-10 shadow-xl">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Forgot password
          </p>
          <h1 className="text-3xl font-semibold">Reset your password</h1>
          <p className="text-slate-600">
            Enter the email address associated with your account.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="space-y-2 text-sm font-medium text-slate-900">
            Email
            <input
              {...register("email")}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-sm text-rose-600">{errors.email.message}</p>
            )}
          </label>

          <p className="text-sm text-slate-500">
            We will notify you with next steps if your email exists in our system.
          </p>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className="text-sm text-slate-600">
          Remembered your password?{" "}
          <Link href="/login" className="font-semibold text-slate-950">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
