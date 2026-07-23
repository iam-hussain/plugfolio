/**
 * Decorative creator-page mock for the landing hero (design-out landing): a
 * profile card (avatar, name, verified tick, Follow) over a 3×2 post grid with
 * one shoppable tile, plus a floating "Buy" card. Purely illustrative — no data,
 * no external images (placeholder tiles use token fills).
 */
export function CreatorMock() {
  return (
    <div className="relative mx-auto w-full max-w-[440px] lg:ml-auto lg:mr-0">
      {/* profile card */}
      <div className="bg-card border-border shadow-primary/10 rounded-[24px] border p-5 shadow-2xl sm:p-[26px]">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/20 size-[60px] shrink-0 rounded-[14px]" aria-hidden />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-display truncate text-[19px] font-bold tracking-[-0.02em]">
                Maya Okafor
              </span>
              <span className="bg-primary inline-flex size-[17px] shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white">
                ✓
              </span>
            </div>
            <div className="text-muted-foreground mt-0.5 font-mono text-[11px]">
              @mayamoves · <span className="text-foreground font-bold">142K</span> followers
            </div>
          </div>
          <span className="text-primary border-border rounded-pill whitespace-nowrap border px-4 py-[7px] text-[13px] font-semibold">
            Follow
          </span>
        </div>

        {/* post grid — tile 2 is the shoppable one */}
        <div className="mt-[18px] grid grid-cols-3 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) =>
            i === 1 ? (
              <div
                key={i}
                className="outline-primary bg-primary/25 relative aspect-square overflow-hidden rounded-lg outline outline-2 -outline-offset-2"
              >
                <span className="bg-primary absolute left-1.5 top-1.5 rounded-[5px] px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-white">
                  SHOP
                </span>
              </div>
            ) : (
              <div
                key={i}
                className="bg-muted-foreground/15 aspect-square rounded-lg"
                aria-hidden
              />
            ),
          )}
        </div>
      </div>

      {/* floating buy card (always dark ink, per the design) */}
      <div className="bg-brand-ink absolute -bottom-[22px] left-1/2 flex w-full max-w-[360px] -translate-x-1/2 items-center gap-[13px] rounded-[16px] p-3.5 shadow-2xl lg:left-[-14px] lg:w-[300px] lg:translate-x-0">
        <div className="bg-primary/30 size-[52px] shrink-0 rounded-[10px]" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-semibold text-white">
            Flux Seamless Leggings
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-white/55">$68 · opens Fluxwear</div>
        </div>
        <span className="bg-accent text-accent-foreground font-display rounded-pill whitespace-nowrap px-4 py-2 text-[13px] font-bold">
          Buy
        </span>
      </div>
    </div>
  );
}
