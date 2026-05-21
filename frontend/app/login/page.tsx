"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/Button";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(values: LoginForm) {
    try {
      const response = await apiFetch<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setToken(response.token);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-md flex-col gap-8 rounded-[2rem] bg-white p-10 shadow-xl">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold">Sign in to your account</h1>
          <p className="text-slate-600">
            Continue managing meeting minutes and action items with smart
            automation.
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
          <label className="space-y-2 text-sm font-medium text-slate-900">
            Password
            <input
              type="password"
              {...register("password")}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-sm text-rose-600">{errors.password.message}</p>
            )}
          </label>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:justify-between">
          <p>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-slate-950">
              Create an account
            </Link>
          </p>
          <Link
            href="/forgot-password"
            className="font-semibold text-slate-950"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </main>
  );
}
