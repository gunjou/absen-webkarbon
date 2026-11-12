import { Toaster } from "sonner";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const ikon = (Icon) => <Icon className="size-5" aria-hidden="true" />;

const tombol =
  "h-10 shrink-0 cursor-pointer rounded-full px-4 text-sm font-semibold transition active:scale-95";

// Toast & konfirmasi memakai gaya aplikasi: kartu rounded-3xl, ubin ikon pastel, tombol pil
export function TemaToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-center"
      icons={{
        success: ikon(CircleCheck),
        error: ikon(CircleAlert),
        warning: ikon(TriangleAlert),
        info: ikon(Info),
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full flex-wrap items-center gap-3 rounded-3xl bg-surface p-4 shadow-pop",
          content: "min-w-0 flex-1",
          title: "text-sm font-semibold text-heading",
          description: "mt-0.5 text-xs text-fg-muted",
          icon: "grid size-10 shrink-0 place-items-center rounded-2xl",
          success: "[&_[data-icon]]:bg-pastel-hijau [&_[data-icon]]:text-success-fg",
          error: "[&_[data-icon]]:bg-pastel-merah [&_[data-icon]]:text-danger-fg",
          warning: "[&_[data-icon]]:bg-pastel-jingga [&_[data-icon]]:text-warning-fg",
          info: "[&_[data-icon]]:bg-pastel-biru [&_[data-icon]]:text-heading",
          actionButton: `${tombol} order-last bg-ink text-ink-fg`,
          cancelButton: `${tombol} ml-auto bg-surface-2 text-heading`,
        },
      }}
    />
  );
}
