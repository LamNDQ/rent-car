"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, Search, ShieldCheck, Users } from "lucide-react";
import { useAuth } from "@app/hooks";
import { userApi } from "@app/lib/api/userApi";
import { StoredUser } from "@app/types";
import { Button, Input } from "@app/components/ui";
import { UserList } from "./_component/UserList";
import { UserRoleModal } from "./_component/UserRoleModal";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<StoredUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        router.push("/access-denied");
      }
    }
  }, [user, isAuthLoading, router]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const allUsers = await userApi.findAll();
      setUsers(allUsers);
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Failed to load users",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role !== "admin") return;

    const timer = setTimeout(() => {
      void fetchUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [user, fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (item) =>
        item.username.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const handleOpenRoleModal = (selected: StoredUser) => {
    setSelectedUser(selected);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleRoleUpdateSuccess = async () => {
    await fetchUsers();
    handleCloseModal();
  };

  if (isAuthLoading || !user || user.role !== "admin") {
    return null;
  }

  const adminCount = users.filter((item) => item.role === "admin").length;
  const vipCount = users.filter((item) => item.role === "vip").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
            <Users className="h-3.5 w-3.5" />
            Accounts
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Manage users
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review every account and update roles in one place.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={fetchUsers}
          disabled={isLoading}
          isLoading={isLoading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-900">
            {isLoading ? "—" : users.length}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Total users
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-900">
            {isLoading ? "—" : adminCount}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Admins
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-2xl font-bold text-amber-900">
            {isLoading ? "—" : vipCount}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700/70">
            VIP members
          </p>
        </div>
      </div>

      {fetchError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {fetchError}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="admin-user-search"
              placeholder="Search username or email..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10"
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
            Showing {filteredUsers.length} of {users.length}
          </p>
        </div>

        <UserList
          users={filteredUsers}
          isLoading={isLoading}
          onEditRole={handleOpenRoleModal}
        />
      </div>

      <UserRoleModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSuccess={handleRoleUpdateSuccess}
      />
    </div>
  );
}
