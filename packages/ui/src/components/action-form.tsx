"use client";

import * as React from "react";
import { toast } from "sonner";
import type { ActionResult } from "./confirm-dialog";

/**
 * ActionForm — an inline form around a result-returning server action that
 * fires the success/error toast itself. For one-click mutations that need no
 * confirmation dialog (resend email, toggle flag, resolve report).
 */
export type ActionFormProps = {
  action: (formData: FormData) => Promise<ActionResult>;
  successToast?: string;
  hiddenFields?: Record<string, string>;
  className?: string;
  children: React.ReactNode;
};

export function ActionForm({
  action,
  successToast,
  hiddenFields,
  className,
  children,
}: ActionFormProps) {
  const [, startTransition] = React.useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        if (successToast) toast.success(successToast);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={submit} className={className}>
      {Object.entries(hiddenFields ?? {}).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}
      {children}
    </form>
  );
}
