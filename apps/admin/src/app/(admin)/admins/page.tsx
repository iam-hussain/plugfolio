import { listOperators } from "@plugfolio/core";
import {
  ActionForm,
  Button,
  ConfirmDialog,
  Input,
  PageHeader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plugfolio/ui";
import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { Panel } from "@/components/panel";
import { requireAdmin } from "@/server/auth";
import { repositories } from "@/server/container";
import {
  changeOwnPasswordAction,
  inviteOperatorAction,
  removeOperatorAction,
  sendOperatorResetAction,
} from "./actions";

export const metadata: Metadata = { title: "Admins" };
export const dynamic = "force-dynamic";

const monoLabel =
  "font-mono text-muted-foreground mb-1.5 block text-[10px] uppercase tracking-[0.08em]";

export default async function AdminsPage() {
  const me = await requireAdmin();
  const operators = await listOperators({ admins: repositories.admins });

  return (
    <>
      <PageHeader title="Admins">
        <ConfirmDialog
          trigger={
            <Button size="xs">
              Add admin
            </Button>
          }
          title="Add admin"
          body="The invite email sets their password. New admins get full operator access."
          confirmLabel="Send invite"
          tone="primary"
          icon={<UserPlus aria-hidden className="size-[18px]" />}
          action={inviteOperatorAction}
          successToast="Invite sent"
        >
          <div className="mt-3.5">
            <label htmlFor="invite-email" className={monoLabel}>
              Email
            </label>
            <Input id="invite-email" name="email" type="email" required placeholder="name@plugfolio.com" />
            <label htmlFor="invite-name" className={`${monoLabel} mt-3`}>
              Name
            </label>
            <Input id="invite-name" name="name" placeholder="Full name" />
          </div>
        </ConfirmDialog>
      </PageHeader>

      <Panel className="overflow-hidden">
        <Table variant="dense">
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>Last sign-in</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {operators.map((operator) => {
              const self = operator.id === me.id;
              return (
                <TableRow key={operator.id}>
                  <TableCell>
                    <span className="block font-semibold">{operator.email}</span>
                    <span className="text-muted-foreground mt-0.5 block text-xs">
                      {self ? `${operator.name ?? "You"} (you)` : (operator.name ?? "—")}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {operator.createdAt.toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {operator.lastSignInAt ? operator.lastSignInAt.toISOString().slice(0, 10) : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="flex justify-end gap-1.5">
                      <ActionForm
                        action={sendOperatorResetAction}
                        hiddenFields={{ email: operator.email }}
                        successToast={`Password reset link sent to ${operator.email}`}
                      >
                        <Button type="submit" size="xs" variant="ghost-muted">
                          Reset password
                        </Button>
                      </ActionForm>
                      {self ? (
                        <Button
                          size="xs"
                          variant="destructive-outline"
                          disabled
                          title="You cannot remove yourself"
                          className="pointer-events-none opacity-40"
                        >
                          Remove
                        </Button>
                      ) : (
                        <ConfirmDialog
                          trigger={<Button size="xs" variant="destructive-outline">Remove</Button>}
                          title="Remove this admin?"
                          body="They lose all operator access immediately. Recorded in the audit log."
                          confirmLabel="Remove"
                          action={removeOperatorAction}
                          hiddenFields={{ adminId: operator.id }}
                          successToast="Admin removed"
                        />
                      )}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Panel>

      <Panel className="mt-4 max-w-[440px] px-6 py-[22px]">
        <h2 className="font-display text-base font-bold">Your account</h2>
        <p className="text-muted-foreground mb-3.5 mt-1.5 text-[13px]">Change your own password.</p>
        <ActionForm action={changeOwnPasswordAction} successToast="Password changed">
          <label htmlFor="current-password" className={monoLabel}>
            Current password
          </label>
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••"
          />
          <label htmlFor="new-password" className={`${monoLabel} mt-3`}>
            New password
          </label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••••"
          />
          <div className="mt-3.5">
            <Button type="submit" size="xs">
              Change password
            </Button>
          </div>
        </ActionForm>
      </Panel>
    </>
  );
}
