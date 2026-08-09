"use client";

import { PlugMark } from "@plugfolio/ui";
import Image from "next/image";
import { Screen } from "./landing-journey";

/**
 * The business journey's four phone faces (design `s2`, business): the
 * requirement form, the creator replies, the terms thread, and "Agreed ✓".
 * Copy and layout follow the prototype line for line.
 */

function FieldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-md border px-[13px] py-[11px]">
      <p className="text-faint text-pico font-mono uppercase tracking-eyebrow">{label}</p>
      <p className="text-micro mt-[3px] font-semibold">{value}</p>
    </div>
  );
}

function ReplyRow({ avatar, handle, meta }: { avatar: string; handle: string; meta: string }) {
  return (
    <div className="border-border bg-background rounded-image flex items-center gap-2.5 border p-[11px]">
      <span className="rounded-pill relative block size-[34px] shrink-0 overflow-hidden">
        <Image src={avatar} alt="" fill sizes="34px" className="object-cover" />
      </span>
      <span className="flex-1">
        <span className="text-nano block font-bold">{handle}</span>
        <span className="text-muted-foreground text-pico mt-px block">{meta}</span>
      </span>
      <span className="text-brand-violet text-pico font-mono uppercase tracking-[0.08em]">
        Reply
      </span>
    </div>
  );
}

export function BusinessScreens() {
  return (
    <>
      <Screen i={0} className="bg-muted">
        <div className="absolute inset-0 flex flex-col gap-[9px] px-3 pb-4 pt-11">
          <p className="text-muted-foreground text-pico px-1 font-mono uppercase tracking-[0.18em]">
            New requirement
          </p>
          <FieldCard label="What you need" value="2 reels · skincare launch" />
          <FieldCard label="Budget" value="₹18,000" />
          <FieldCard label="Deadline" value="14 days" />
          <div className="bg-brand-ink font-display text-label rounded-pill mt-auto p-[13px] text-center font-semibold text-white">
            Post requirement
          </div>
        </div>
      </Screen>

      <Screen i={1} className="bg-muted">
        <div className="absolute inset-0 flex flex-col gap-[9px] px-3 pb-4 pt-11">
          <p className="text-muted-foreground text-pico px-1 font-mono uppercase tracking-[0.18em]">
            Replies · 2
          </p>
          <ReplyRow
            avatar="/landing/avatars/maya.jpg"
            handle="@mayarao"
            meta="48k followers · fashion & beauty"
          />
          <ReplyRow
            avatar="/landing/avatars/arjun.jpg"
            handle="@arjunmakes"
            meta="31k followers · grooming"
          />
          <p className="text-faint text-nano px-1 leading-[1.5]">
            Only creators who opted into collabs can reply.
          </p>
        </div>
      </Screen>

      <Screen i={2} className="bg-background">
        <div className="absolute inset-0 flex flex-col justify-center gap-2.5 px-3.5 py-5">
          <div className="bg-brand-violet-wash text-foreground text-nano max-w-[85%] self-end rounded-[16px_16px_4px_16px] px-[13px] py-[11px] leading-[1.5]">
            Can you do both reels before the 20th?
          </div>
          <div className="border-border bg-muted text-nano max-w-[85%] self-start rounded-[16px_16px_16px_4px] border px-[13px] py-[11px] leading-[1.5]">
            Yes — second one needs the product by Friday.
          </div>
          <div className="border-brand-violet rounded-panel border-[1.5px] p-3">
            <p className="text-brand-violet text-pico font-mono uppercase tracking-eyebrow">Terms</p>
            <p className="text-nano mt-[5px] leading-[1.7]">2 reels · ₹18,000 · by 20 Aug</p>
          </div>
          <div className="bg-brand-violet font-display text-label rounded-pill p-3 text-center font-semibold text-white">
            Accept terms
          </div>
        </div>
      </Screen>

      <Screen i={3} className="bg-brand-violet">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
          <PlugMark tone="violet" size="lg" />
          <p className="font-display text-accent text-name-lg font-extrabold tracking-[-0.03em]">
            Agreed ✓
          </p>
          <p className="text-pico font-mono uppercase tracking-[0.16em]">both sides accepted</p>
          <p className="text-micro max-w-[210px] leading-[1.6] text-white/80">
            Payment settles off-platform. Plugfolio never holds the money.
          </p>
        </div>
      </Screen>
    </>
  );
}
