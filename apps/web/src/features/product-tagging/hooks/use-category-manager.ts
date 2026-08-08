"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCategory, removeCategory, updateCategory } from "../api";

/**
 * Everything the shelf manager *does* (ADR-0010): the add form's state and the
 * four writes — add, rename, reorder, delete — with none of what the rows look
 * like. Pulled out of the component so the writes read on their own and the
 * presentational rows stay a plain map.
 *
 * Deleting never deletes content — posts and products fall back to "All" (SET
 * NULL in the schema); the confirm copy lives at the call site with the row.
 */
export function useCategoryManager(profileId: string) {
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
    mutationFn: async (move: {
      id: string;
      sortOrder: number;
      otherId: string;
      otherSortOrder: number;
    }) => {
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

  return {
    title,
    setTitle,
    description,
    setDescription,
    editing,
    setEditing,
    add,
    rename,
    reorder,
    remove,
    busy,
    error,
  };
}
