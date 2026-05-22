"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { setToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/Button";
import { useToast } from "@/components/useToast";

const signupSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({ resolver: zodResolver(signupSchema) });
  const { showToast } = useToast();

  async function onSubmit(values: SignupForm) {
    try {
      const response = await apiFetch<{ token: string }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(values),
      });
      setToken(response.token);
      showToast("Welcome aboard! Your account is ready.", "success");
      router.push("/dashboard");
    } catch (err) {
      showToast((err as Error).message, "error");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-950 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-md flex-col gap-8 rounded-[2rem] bg-white p-10 shadow-xl">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            Create your account
          </p>
          <h1 className="text-3xl font-semibold">
            Join the MOM generator platform
          </h1>
          <p className="text-slate-600">
            Sign up to convert meeting conversations into structured follow-up
            workflows.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <label className="space-y-2 text-sm font-medium text-slate-900">
            Name
            <input
              {...register("name")}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="Jane Doe"
            />
            {errors.name && (
              <p className="text-sm text-rose-600">{errors.name.message}</p>
            )}
          </label>
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
              placeholder="Create a password"
            />
            {errors.password && (
              <p className="text-sm text-rose-600">{errors.password.message}</p>
            )}
          </label>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-950">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
