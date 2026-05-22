import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  variant?: "success" | "error" | "info";
  open: boolean;
}

const variantClasses: Record<string, string> = {
  success:
    "border-emerald-300/30 from-emerald-500/20 via-emerald-400/10 to-transparent text-emerald-100",
  error:
    "border-rose-300/30 from-rose-500/20 via-rose-400/10 to-transparent text-rose-100",
  info:
    "border-sky-300/30 from-sky-500/20 via-sky-400/10 to-transparent text-sky-100",
};

const variantLabels: Record<string, string> = {
  success: "Success",
  error: "Error",
  info: "Info",
};

const variantIcons: Record<string, string> = {
  success: "✓",
  error: "⚠️",
  info: "ℹ️",
};

export function Toast({ message, variant = "info", open }: ToastProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          className={`fixed right-6 bottom-6 z-50 w-full max-w-sm rounded-[1.75rem] border bg-slate-950/95 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl ring-1 ring-white/10 ${variantClasses[variant]}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-base font-semibold">
              {variantIcons[variant]}
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.26em] text-slate-400">
                {variantLabels[variant]}
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-100">{message}</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
