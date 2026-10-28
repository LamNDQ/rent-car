"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@app/hooks";
import { userApi } from "@app/lib/api/userApi";
import { StoredUser } from "@app/types";
import { Button } from "@app/components/ui/Button";
import { Input } from "@app/components/ui/Input";
import { UserList } from "./_component/UserList";
import { UserRoleModal } from "./_component/UserRoleModal";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthLoading } = useAuth();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const allUsers = await userApi.findAll();
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const lowerQuery = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(lowerQuery) ||
        u.email.toLowerCase().includes(lowerQuery)
    );
  }, [users, searchQuery]);

  const handleOpenRoleModal = (u: StoredUser) => {
    setSelectedUser(u);
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

  return (
    <div className="bg-foreground p-6 rounded-lg shadow-md w-full overflow-x-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Input
            placeholder="Search users by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant="primary" onClick={fetchUsers} disabled={isLoading}>
          Refresh List
        </Button>
      </div>

      <UserList 
        users={filteredUsers} 
        isLoading={isLoading} 
        onEditRole={handleOpenRoleModal} 
      />

      <UserRoleModal
        isOpen={isModalOpen}
        user={selectedUser}
        onClose={handleCloseModal}
        onSuccess={handleRoleUpdateSuccess}
      />
    </div>
  );
}
