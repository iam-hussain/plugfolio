/** "1 creator", "4 creators" — a count pill that reads "1 creators" is a typo. */
export function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}
