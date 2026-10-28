"use client";

import { useState } from "react";
import { StoredUser } from "@app/types";
import { Button } from "@app/components/ui/Button";
import { userApi } from "@app/lib/api/userApi";

export interface UserRoleModalProps {
  isOpen: boolean;
  user: StoredUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserRoleModal({ isOpen, user, onClose, onSuccess }: UserRoleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleRoleChange = async (newRole: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await userApi.update(user.id, { role: newRole as any });
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update role");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl border">
        <h2 className="text-xl font-bold mb-4">Edit Role for {user.username}</h2>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="space-y-3">
          <p className="text-sm text-zinc-500">Select new role:</p>
          
          <div className="flex flex-col gap-2">
            <Button 
              variant={user.role === 'admin' ? 'primary' : 'outline'} 
              onClick={() => handleRoleChange('admin')}
              disabled={isLoading}
            >
              Admin
            </Button>
            <Button 
              variant={user.role === 'vip' ? 'primary' : 'outline'} 
              onClick={() => handleRoleChange('vip')}
              disabled={isLoading}
            >
              VIP
            </Button>
            <Button 
              variant={user.role === 'normal' ? 'primary' : 'outline'} 
              onClick={() => handleRoleChange('normal')}
              disabled={isLoading}
            >
              Normal User
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
