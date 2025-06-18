"use client"

import { RefreshCcw } from "lucide-react";
import { useFormStatus } from "react-dom"
import { Button } from "./button";

const ButtonLoading = ({
    children,
    className,
    type = "submit",
    disabled = false
}: Readonly<{children: React.ReactNode, className?: string, type?: "submit" | "reset" | "button", disabled?: boolean}>) => {
    const { pending } = useFormStatus();

  return  <Button disabled={disabled ? disabled : pending} type={type} className={className}>
      {pending ? <span className="flex gap-2 items-center"><RefreshCcw className="animate-spin" /> {children}</span> : children}
  </Button>
  
}

export default ButtonLoading;
