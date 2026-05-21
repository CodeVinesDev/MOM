import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  variant?: "success" | "error" | "info";
  open: boolean;
}

const variantClasses: Record<string, string> = {
  success: "bg-emerald-950 text-white",
  error: "bg-rose-950 text-white",
  info: "bg-slate-950 text-white",
};

export function Toast({ message, variant = "info", open }: ToastProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.2 }}
          className={`fixed right-4 bottom-4 z-50 max-w-xs rounded-2xl p-4 shadow-xl ${variantClasses[variant]}`}
        >
          <p className="text-sm leading-6">{message}</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
