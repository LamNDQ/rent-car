"use client";
import { Container } from "@/components/ui";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
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
