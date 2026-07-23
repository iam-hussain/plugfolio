import { Button, Input } from "@plugfolio/ui";

/** Page title + the GET search form every admin list screen shares. */
export function SearchHeader({
  title,
  query,
  placeholder,
}: {
  title: string;
  query?: string;
  placeholder: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <form className="flex gap-2">
        <Input
          name="q"
          defaultValue={query ?? ""}
          placeholder={placeholder}
          className="w-64"
          aria-label={`Search ${title.toLowerCase()}`}
        />
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
    </div>
  );
}
