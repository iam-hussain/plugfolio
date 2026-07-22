"use client";

import { useState } from "react";

/** Password field with a labeled show/hide toggle (brief 04: no blind typing). */
export type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password" | "current-password";
};

export function PasswordInput({ id, value, onChange, autoComplete }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={8}
        maxLength={100}
        autoComplete={autoComplete}
        className="border-border bg-background flex-1 rounded-md border p-2 text-sm"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-muted-foreground text-xs underline"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
