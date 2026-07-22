"use client";

import type { CategoryView } from "@plugfolio/core";
import { Button } from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCategory, removeCategory } from "../api";

/**
 * Manage a profile's shelves (ADR-0010): add and delete. Deleting never
 * deletes content — items fall back to "All" (SET NULL in the schema).
 */
export type CategoryManagerProps = {
  profileId: string;
  categories: readonly CategoryView[];
};

export function CategoryManager({ profileId, categories }: CategoryManagerProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const add = useMutation({
    mutationFn: () =>
      createCategory({ profileId, title, description: description.trim() || null }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      router.refresh();
    },
  });

  const remove = useMutation({
    mutationFn: (categoryId: string) => removeCategory(categoryId),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="flex flex-col gap-6">
      {categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Group your posts and products into shelves — &quot;Desk setup&quot;, &quot;Budget
          skincare&quot;. Shoppers filter your page by them.
        </p>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {categories.map((category) => (
            <li key={category.id} className="flex items-start justify-between gap-2 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{category.title}</p>
                {category.description ? (
                  <p className="text-muted-foreground truncate text-xs">{category.description}</p>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={remove.isPending}
                onClick={() => {
                  // Posts and products stay — they'll show under "All".
                  if (window.confirm(`Delete "${category.title}"? Posts and products stay.`)) {
                    remove.mutate(category.id);
                  }
                }}
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}

      <form
        className="flex flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (title.trim()) add.mutate();
        }}
      >
        <label htmlFor="category-title" className="text-sm font-medium">
          New category
        </label>
        <input
          id="category-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={50}
          placeholder="Title — e.g. Desk setup"
          className="border-border bg-background rounded-md border p-2 text-sm"
        />
        <label htmlFor="category-description" className="sr-only">
          Description (optional)
        </label>
        <input
          id="category-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={200}
          placeholder="Description (optional)"
          className="border-border bg-background rounded-md border p-2 text-sm"
        />
        <div className="flex items-center justify-between">
          {add.isError ? (
            <p role="alert" className="text-muted-foreground text-xs">
              {add.error.message}
            </p>
          ) : (
            <span />
          )}
          <Button type="submit" size="sm" disabled={add.isPending || !title.trim()}>
            {add.isPending ? "Adding…" : "Add"}
          </Button>
        </div>
      </form>
    </div>
  );
}
