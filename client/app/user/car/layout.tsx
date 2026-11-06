"use client";

import { ReactNode, Suspense } from "react";
import { PageBanner } from "./_component/PageBanner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Container, Footer, Header } from "@/components/ui";

interface RootLayoutProps {
  children: ReactNode;
}

function CarLayoutContent({ children }: RootLayoutProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const isFleetPage = pathname === "/user/car";

  const handleDateChange = (type: "startDate" | "endDate", date: string) => {
    const params = new URLSearchParams(searchParams);
    if (date) {
      params.set(type, date);
    } else {
      params.delete(type);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {isFleetPage && (
          <PageBanner
            title="Find your next ride"
            startDate={searchParams.get("startDate") || ""}
            endDate={searchParams.get("endDate") || ""}
            onStartDateChange={(date) => handleDateChange("startDate", date)}
            onEndDateChange={(date) => handleDateChange("endDate", date)}
          />
        )}
        <Container className="py-10 lg:py-14">{children}</Container>
      </main>
      <Footer />
    </div>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
            Loading the fleet...
          </div>
        </div>
      }>
      <CarLayoutContent>{children}</CarLayoutContent>
    </Suspense>
  );
}
