/**
 * A confirmation screen: one status object (a stamp), one headline, one action
 * (DESIGN auth.html §status). Used by check-email, verified, reset-sent, and
 * password-set — the flows that end in a message rather than a form.
 */
export function AuthStatus({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <span className="bg-active text-brand-violet-deep rounded-pill mx-auto mb-5 grid size-16 place-items-center [&_svg]:size-7">
        {icon}
      </span>
      <h1 className="font-display text-display-lg font-extrabold tracking-[-0.035em]">{title}</h1>
      <div className="mt-3 flex flex-col items-center gap-2.5">{children}</div>
    </div>
  );
}
