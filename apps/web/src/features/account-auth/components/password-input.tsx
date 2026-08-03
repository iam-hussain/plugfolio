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
  placeholder?: string;
  /** The design's stated policy is 10 (v2 §join); login stays permissive. */
  minLength?: number;
};

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength = autoComplete === "new-password" ? 10 : 1,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="bg-active border-border focus-within:border-ring rounded-panel flex items-center border">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        minLength={minLength}
        maxLength={100}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="text-foreground text-copy min-w-0 flex-1 bg-transparent py-[13px] pl-3.5 outline-none"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground text-pico shrink-0 px-3.5 py-[13px] font-mono uppercase tracking-[0.08em]"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
