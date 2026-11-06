"use client";

import { UserRound } from "lucide-react";
import { StoredUser } from "@app/types";
import { Badge, Button } from "@app/components/ui";

export interface UserListProps {
  users: StoredUser[];
  isLoading: boolean;
  onEditRole: (user: StoredUser) => void;
}

function roleVariant(role: string) {
  if (role === "admin") return "error";
  if (role === "vip") return "warning";
  return "info";
}

export function UserList({ users, isLoading, onEditRole }: UserListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
          <UserRound className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-900">
          No users found
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="border-b border-slate-100 px-5 py-2 text-[11px] text-slate-400 md:hidden">
        Swipe horizontally to see roles and actions.
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/70">
            {["User", "Role", "Actions"].map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr
              key={user.id}
              className="transition-colors hover:bg-slate-50/60">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                    {user.username?.charAt(0).toUpperCase() ?? (
                      <UserRound className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {user.username}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>
              </td>

              <td className="whitespace-nowrap px-5 py-3.5">
                <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
              </td>

              <td className="whitespace-nowrap px-5 py-3.5 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditRole(user)}>
                  Edit role
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}
