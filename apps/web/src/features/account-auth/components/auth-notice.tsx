import { Mail } from "lucide-react";

/**
 * Centered notice column from the design-out check-email / verify screens:
 * a soft-violet mail-icon tile, Sora title, muted body, then actions.
 */
export function AuthNotice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div aria-live="polite" className="flex flex-col items-center text-center">
      <div className="bg-primary/10 border-border flex size-[58px] items-center justify-center rounded-[14px] border">
        <Mail aria-hidden strokeWidth={1.9} className="text-primary size-[27px]" />
      </div>
      <h1 className="font-display mt-[22px] text-[26px] font-extrabold tracking-[-0.03em]">
        {title}
      </h1>
      {children}
    </div>
  );
}
