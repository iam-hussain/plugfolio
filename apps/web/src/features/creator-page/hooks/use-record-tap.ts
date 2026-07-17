import { useMutation } from "@tanstack/react-query";
import { recordTap } from "../api";

/**
 * Records an outbound tap as a mutation (§6 attribution is a write). Idempotency
 * is the caller's responsibility per §6.8 — pass a fresh `idempotencyKey` per
 * user intent so a retry of the same tap collapses to one event server-side.
 */
export function useRecordTap() {
  return useMutation({ mutationFn: recordTap });
}
