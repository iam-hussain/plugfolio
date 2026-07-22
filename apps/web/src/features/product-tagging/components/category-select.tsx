"use client";

import type { CategoryView } from "@plugfolio/core";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { setPostCategory, setProductCategory } from "../api";

/**
 * The one category control (ADR-0010): a single-select of this profile's
 * shelves + "None", saving on change. Assignment must never feel like a
 * required step — None is always first.
 */
export type CategorySelectProps = {
  target: { kind: "post"; postId: string; profileId: string } | { kind: "product"; productId: string };
  categories: readonly CategoryView[];
  currentCategoryId: string | null;
};

export function CategorySelect({ target, categories, currentCategoryId }: CategorySelectProps) {
  const router = useRouter();
  const [value, setValue] = useState(currentCategoryId ?? "");

  const save = useMutation({
    mutationFn: (categoryId: string | null) =>
      target.kind === "post"
        ? setPostCategory(target.postId, { profileId: target.profileId, categoryId })
        : setProductCategory(target.productId, { categoryId }),
    onSuccess: () => router.refresh(),
  });

  if (categories.length === 0) return null;

  return (
    <label className="text-muted-foreground flex items-center gap-2 text-xs">
      Category
      <select
        value={value}
        disabled={save.isPending}
        onChange={(event) => {
          setValue(event.target.value);
          save.mutate(event.target.value || null);
        }}
        className="border-border bg-background rounded-md border p-1 text-xs"
      >
        <option value="">None</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.title}
          </option>
        ))}
      </select>
      {save.isError ? (
        <span role="alert" className="text-xs">
          {save.error.message}
        </span>
      ) : null}
    </label>
  );
}
