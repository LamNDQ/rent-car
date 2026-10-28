"use client";

import { StoredUser } from "@app/types";

export interface UserListProps {
  users: StoredUser[];
  isLoading: boolean;
  onEditRole: (user: StoredUser) => void;
}

export function UserList({ users, isLoading, onEditRole }: UserListProps) {
  if (isLoading) {
    return <div className="p-4 text-center">Loading users...</div>;
  }

  if (users.length === 0) {
    return <div className="p-4 text-center">No users found.</div>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Username</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="px-4 py-3 font-semibold text-zinc-900">{user.username}</td>
              <td className="px-4 py-3 text-zinc-500">{user.email}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {user.role}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onEditRole(user)}
                  className="text-blue-600 hover:underline"
                >
                  Edit Role
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
