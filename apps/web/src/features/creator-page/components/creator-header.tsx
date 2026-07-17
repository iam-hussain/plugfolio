/**
 * Feature-scoped UI for the creator page (the no-login shopper surface).
 * Presentational; data fetching lives in the feature's hooks/api, not here.
 */
export type CreatorHeaderProps = {
  handle: string;
  displayName?: string;
};

export function CreatorHeader({ handle, displayName }: CreatorHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-1 py-8 text-center">
      <div className="bg-muted mb-2 h-20 w-20 rounded-full" aria-hidden />
      <h1 className="font-display text-2xl font-semibold">{displayName ?? handle}</h1>
      <p className="text-muted-foreground text-sm">@{handle}</p>
    </header>
  );
}
