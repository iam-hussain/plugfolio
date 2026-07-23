"use client";

import type { CategoryView } from "@plugfolio/core";
import { NativeSelect, NativeSelectOption } from "@plugfolio/ui";
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
      <NativeSelect
        value={value}
        disabled={save.isPending}
        onChange={(event) => {
          setValue(event.target.value);
          save.mutate(event.target.value || null);
        }}
      >
        <NativeSelectOption value="">None</NativeSelectOption>
        {categories.map((category) => (
          <NativeSelectOption key={category.id} value={category.id}>
            {category.title}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {save.isError ? (
        <span role="alert" className="text-destructive text-xs">
          {save.error.message}
        </span>
      ) : null}
    </label>
  );
}
