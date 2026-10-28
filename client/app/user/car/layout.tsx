"use client";

import { ReactNode, Suspense } from "react";
import { PageBanner } from "./_component/PageBanner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/ui";
interface RootLayoutProps {
  children: ReactNode;
}

function CarLayoutContent({ children }: RootLayoutProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

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
    <div className="flex flex-col md:flex-row w-full h-full">
      <section className="flex-1 p-6 lg:p-8">
        <Header />
        <PageBanner
          title="Choose a Date"
          startDate={searchParams.get("startDate") || ""}
          endDate={searchParams.get("endDate") || ""}
          onStartDateChange={(date) => handleDateChange("startDate", date)}
          onEndDateChange={(date) => handleDateChange("endDate", date)}
        />
        {children}
      </section>
    </div>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CarLayoutContent>{children}</CarLayoutContent>
    </Suspense>
  );
}
