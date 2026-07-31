"use client";

import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Label,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { proposeTerms } from "../api";

/**
 * Propose terms (brief 12): either side pins content + price + deadline on
 * the thread. The latest proposal is the live one and RESETS both
 * acceptances — Agreed always means agreed to these terms.
 */
export function ProposeTermsForm({ collabId }: { collabId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [deadline, setDeadline] = useState("");

  const submit = useMutation({
    mutationFn: () =>
      proposeTerms(collabId, {
        content,
        price: price.trim() || null,
        deadline: deadline ? new Date(deadline) : null,
      }),
    onSuccess: () => {
      setContent("");
      setPrice("");
      setDeadline("");
      router.refresh();
    },
  });

  return (
    <Collapsible>
      <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-copy">
        <ChevronDown className="size-4" />
        Propose terms
      </CollapsibleTrigger>
      <CollapsibleContent>
        <form
          className="flex flex-col gap-3 pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (content.trim()) submit.mutate();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="terms-content">What gets made</Label>
            <Input
              id="terms-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              maxLength={300}
              required
              placeholder="One 30s reel, product in the first 5 seconds"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="terms-price">Price (optional)</Label>
              <Input
                id="terms-price"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                maxLength={60}
                placeholder="$200"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="terms-deadline">Deadline (optional)</Label>
              <Input
                id="terms-deadline"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </div>
          </div>
          {submit.isError ? (
            <p role="alert" className="text-destructive text-micro">
              {submit.error.message}
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-micro">
              A new proposal resets both acceptances.
            </p>
            <Button type="submit" size="sm" disabled={submit.isPending || !content.trim()}>
              {submit.isPending ? "Proposing…" : "Propose"}
            </Button>
          </div>
        </form>
      </CollapsibleContent>
    </Collapsible>
  );
}
