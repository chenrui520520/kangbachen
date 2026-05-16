import type { ComponentProps, ReactNode } from "react";
import { Toaster } from "../components/ui/sonner";

type Props = ComponentProps<typeof Toaster> & {
  children: ReactNode;
};

export function GlobalToastProvider({ children, ...toasterProps }: Props) {
  return (
    <>
      {children}
      <Toaster richColors closeButton {...toasterProps} />
    </>
  );
}
