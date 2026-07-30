"use client";

import type { CategoryView } from "@plugfolio/core";
import {
  Button,
  CategoryRow,
  CategoryRows,
  DashCard,
  DashCardHead,
  DashCardTitle,
  DashFieldForm,
  EmptyState,
  IconAction,
  IconActions,
  Input,
} from "@plugfolio/ui";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Check, Pencil, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCategory, removeCategory, updateCategory } from "../api";

/**
 * Manage a profile's shelves (ADR-0010, DESIGN dashboard.html §5.22): add,
 * rename, reorder, delete.
 *
 * Deleting never deletes content — posts and products fall back to "All"
 * (SET NULL in the schema), which is why the confirm says so rather than
 * warning about loss that doesn't happen.
 */
export type CategoryManagerProps = {
  profileId: string;
  categories: readonly CategoryView[];
  /** Per-shelf counts, so a creator can see what a delete would loosen. */
  counts?: ReadonlyMap<string, { posts: number; products: number }>;
};

export function CategoryManager({ profileId, categories, counts }: CategoryManagerProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<string | null>(null);

  const refresh = () => router.refresh();

  const add = useMutation({
    mutationFn: () => createCategory({ profileId, title, description: description.trim() || null }),
    onSuccess: () => {
      setTitle("");
      setDescription("");
      refresh();
    },
  });
  const rename = useMutation({
    mutationFn: (next: { id: string; title: string; description: string | null }) =>
      updateCategory(next.id, { title: next.title, description: next.description }),
    onSuccess: () => {
      setEditing(null);
      refresh();
    },
  });
  // Reorder is a swap of two sortOrders, not a drag surface: five shelves in a
  // list don't earn a pointer-events implementation, and arrows work on a
  // phone and with a keyboard, which a drag handle does not.
  const reorder = useMutation({
    mutationFn: async (move: { id: string; sortOrder: number; otherId: string; otherSortOrder: number }) => {
      await updateCategory(move.id, { sortOrder: move.otherSortOrder });
      await updateCategory(move.otherId, { sortOrder: move.sortOrder });
    },
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (categoryId: string) => removeCategory(categoryId),
    onSuccess: refresh,
  });

  const busy = rename.isPending || reorder.isPending || remove.isPending;
  const error = add.error ?? rename.error ?? reorder.error ?? remove.error;

  return (
    <>
      <DashCard>
        <DashCardHead>
          <DashCardTitle>Add a shelf</DashCardTitle>
        </DashCardHead>
        <DashFieldForm
          className="mt-0"
          onSubmit={(event) => {
            event.preventDefault();
            if (title.trim()) add.mutate();
          }}
        >
          <label className="min-w-0 flex-[1_1_220px]">
            <span className="sr-only">Shelf title</span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={50}
              placeholder="Title — e.g. Desk setup"
            />
          </label>
          <label className="min-w-0 flex-[1_1_220px]">
            <span className="sr-only">Shelf description</span>
            <Input
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={200}
              placeholder="Description (optional)"
            />
          </label>
          <Button type="submit" disabled={add.isPending || !title.trim()}>
            {add.isPending ? "Adding…" : "Add"}
          </Button>
        </DashFieldForm>
      </DashCard>

      {categories.length === 0 ? (
        <EmptyState title="Group your posts and products into shelves" className="mt-3.5">
          A shelf is a title and an optional line of description. Shoppers use them as the chip row
          on your page.
        </EmptyState>
      ) : (
        <CategoryRows>
          {categories.map((category, index) => {
            const count = counts?.get(category.id);
            const previous = categories[index - 1];
            const next = categories[index + 1];
            return (
              <CategoryRow
                key={category.id}
                handle={
                  <span className="flex flex-none flex-col">
                    <IconAction
                      label={`Move ${category.title} up`}
                      className="size-6"
                      disabled={!previous || busy}
                      onClick={() =>
                        previous &&
                        reorder.mutate({
                          id: category.id,
                          sortOrder: category.sortOrder,
                          otherId: previous.id,
                          otherSortOrder: previous.sortOrder,
                        })
                      }
                    >
                      <ChevronUp aria-hidden />
                    </IconAction>
                    <IconAction
                      label={`Move ${category.title} down`}
                      className="size-6"
                      disabled={!next || busy}
                      onClick={() =>
                        next &&
                        reorder.mutate({
                          id: category.id,
                          sortOrder: category.sortOrder,
                          otherId: next.id,
                          otherSortOrder: next.sortOrder,
                        })
                      }
                    >
                      <ChevronDown aria-hidden />
                    </IconAction>
                  </span>
                }
                title={
                  editing === category.id ? (
                    <RenameForm
                      category={category}
                      pending={rename.isPending}
                      onCancel={() => setEditing(null)}
                      onSave={(values) => rename.mutate({ id: category.id, ...values })}
                    />
                  ) : (
                    category.title
                  )
                }
                description={editing === category.id ? undefined : category.description}
                counts={
                  count
                    ? `${count.posts} ${count.posts === 1 ? "post" : "posts"} · ${count.products} ${
                        count.products === 1 ? "product" : "products"
                      }`
                    : null
                }
                actions={
                  editing === category.id ? null : (
                    <IconActions>
                      <IconAction
                        label={`Rename ${category.title}`}
                        onClick={() => setEditing(category.id)}
                      >
                        <Pencil aria-hidden />
                      </IconAction>
                      <IconAction
                        tone="danger"
                        label={`Delete ${category.title}`}
                        disabled={busy}
                        onClick={() => {
                          // Posts and products stay — they'll show under "All".
                          if (
                            window.confirm(
                              `Delete "${category.title}"? Posts and products stay, they just come off this shelf.`,
                            )
                          ) {
                            remove.mutate(category.id);
                          }
                        }}
                      >
                        <Trash2 aria-hidden />
                      </IconAction>
                    </IconActions>
                  )
                }
              />
            );
          })}
        </CategoryRows>
      )}

      {error ? (
        <p role="alert" className="text-destructive text-copy mt-3.5">
          {error.message}
        </p>
      ) : null}
    </>
  );
}

/** Rename in place, because sending someone to a screen to change a word is a screen too many. */
function RenameForm({
  category,
  pending,
  onCancel,
  onSave,
}: {
  category: CategoryView;
  pending: boolean;
  onCancel: () => void;
  onSave: (values: { title: string; description: string | null }) => void;
}) {
  const [title, setTitle] = useState(category.title);
  const [description, setDescription] = useState(category.description ?? "");

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (title.trim()) onSave({ title: title.trim(), description: description.trim() || null });
      }}
    >
      <label className="min-w-0 flex-[1_1_140px]">
        <span className="sr-only">Rename {category.title}</span>
        <Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={50} />
      </label>
      <label className="min-w-0 flex-[1_1_180px]">
        <span className="sr-only">Description for {category.title}</span>
        <Input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={200}
          placeholder="Description (optional)"
        />
      </label>
      <IconActions>
        <IconAction label="Save" type="submit" disabled={pending || !title.trim()}>
          <Check aria-hidden />
        </IconAction>
        <IconAction label="Cancel" onClick={onCancel}>
          <X aria-hidden />
        </IconAction>
      </IconActions>
    </form>
  );
}
