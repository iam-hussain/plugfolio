/**
 * FilterSelect — the design's status dropdown: strong hairline, 8px radius,
 * 13px text. A plain native select for GET filter forms (no client JS).
 */
export function FilterSelect({
  name,
  defaultValue,
  options,
  label,
}: {
  name: string;
  defaultValue?: string;
  /** [value, label] pairs; "" = the unfiltered default. */
  options: readonly (readonly [string, string])[];
  label: string;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue ?? ""}
      aria-label={label}
      className="border-border-strong bg-background text-foreground cursor-pointer appearance-none rounded-lg border py-2 pl-3 pr-[30px] text-[13px] outline-none"
    >
      {options.map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </select>
  );
}
