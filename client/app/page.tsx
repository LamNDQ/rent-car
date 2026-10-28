"use client";
import { Container } from "@/components/ui";
import { Header } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function Home() {
  // Placeholder
  return (
    <div className="flex flex-col gap-8">
      <Header />
      <Container>
        <div className="py-8">
          <h2 className="text-2xl font-semibold mb-4 text-zinc-100">
            Welcome to Car Rental
          </h2>
        </div>
      </Container>
    </div>
  );
}
