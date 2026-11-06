import { Suspense } from "react";
import SsoSuccessContent from "./SsoSuccessContent";

export default function SsoSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            Loading...
          </div>
        </div>
      }>
      <SsoSuccessContent />
    </Suspense>
  );
}
