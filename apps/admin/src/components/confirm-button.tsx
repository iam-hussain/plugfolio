"use client";

import { Button, type ButtonProps } from "@plugfolio/ui";

/** A submit button that asks before firing — takedowns are irreversible.
 * ponytail: native confirm(); upgrade to AlertDialog if operators want undo-style UX. */
export function ConfirmButton({ message, ...props }: ButtonProps & { message: string }) {
  return (
    <Button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      {...props}
    />
  );
}
