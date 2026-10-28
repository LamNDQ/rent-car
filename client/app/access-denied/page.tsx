"use client";
import { Button } from "@app/components/ui/Button";
import { useRouter } from "next/navigation";

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-700 bg-background p-10 shadow-lg shadow-black/30 text-center">
        <h1 className="text-3xl font-semibold text-foreground">Access Denied</h1>
        <p className="mt-2 text-sm text-foreground/80">
          You do not have the required permissions to access this page.
        </p>
        <div className="mt-8">
          <Button 
            variant="primary" 
            onClick={() => router.push("/")}
            className="w-full"
          >
            Back to main page
          </Button>
        </div>
      </div>
    </div>
  );
}
