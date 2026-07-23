"use client";

import * as React from "react";
import { Button, type ButtonProps } from "./button";

/**
 * ConfirmButton — a submit button that asks before firing, for irreversible
 * form actions (takedowns, deletions). Composes Button; all styling comes
 * from Button's variants.
 * ponytail: native confirm(); upgrade to AlertDialog if operators want undo-style UX.
 */
export type ConfirmButtonProps = ButtonProps & { message: string };

export function ConfirmButton({ message, onClick, ...props }: ConfirmButtonProps) {
  return (
    <Button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...props}
    />
  );
}
