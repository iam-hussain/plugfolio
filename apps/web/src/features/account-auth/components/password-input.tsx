"use client";

import { useState } from "react";

/**
 * Password field with a labeled show/hide toggle inside the input (brief 04:
 * mobile keyboards make blind typing error-prone). Same 9px-radius raised
 * field as the other auth inputs.
 */
export type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "new-password" | "current-password";
};

export function PasswordInput({ id, value, onChange, autoComplete }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="bg-muted border-border focus-within:border-ring flex items-center rounded-[9px] border">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={8}
        maxLength={100}
        autoComplete={autoComplete}
        className="text-foreground min-w-0 flex-1 bg-transparent py-[13px] pl-3.5 text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground shrink-0 px-3.5 py-[13px] font-mono text-[10.5px] uppercase tracking-[0.08em]"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
