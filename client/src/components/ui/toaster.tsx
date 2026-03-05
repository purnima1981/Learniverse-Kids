import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all animate-in slide-in-from-bottom-5",
            t.variant === "destructive"
              ? "border-destructive/50 bg-destructive/90 text-destructive-foreground"
              : "border-border bg-card text-card-foreground"
          )}
        >
          <div className="flex-1">
            {t.title && <p className="text-sm font-semibold">{t.title}</p>}
            {t.description && <p className="text-sm opacity-90">{t.description}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
