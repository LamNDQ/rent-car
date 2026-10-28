import { Suspense } from "react";
import SsoSuccessContent from "./SsoSuccessContent";

export default function SsoSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Loading...</h1>
        </div>
      </div>
    }>
      <SsoSuccessContent />
    </Suspense>
  );
}
