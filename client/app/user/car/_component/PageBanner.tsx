"use client";

import { twMerge } from "tailwind-merge";
import { Container } from "@/components/ui";
import { Input } from "@/components/ui";
import { Calendar } from "lucide-react";

export interface PageBannerProps {
  title: string;
  startDate?: string;
  endDate?: string;
  onStartDateChange?: (date: string) => void;
  onEndDateChange?: (date: string) => void;
}

export function PageBanner({
  title,
  startDate = "",
  endDate = "",
  onStartDateChange,
  onEndDateChange,
}: PageBannerProps) {
  return (
    <div className="relative w-full bg-zinc-900 py-12 md:py-16">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left Side: Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl uppercase">
              {title}
            </h1>
          </div>

          {/* Right Side: Date Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex items-center">
              <div className="absolute left-3 z-10 text-zinc-400 pointer-events-none">
                <Calendar className="h-4 w-4" />
              </div>
              <Input
                type="date"
                value={startDate}
                className={twMerge(
                  "pl-10 w-full sm:w-50 bg-white/10 border-white/20 text-white placeholder:text-zinc-400 focus:ring-zinc-400",
                  // Filter to invert the native browser date picker icon to white
                  "[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert",
                )}
                onChange={(e) => onStartDateChange?.(e.target.value)}
                aria-label="Start Date"
              />
            </div>

            <span className="hidden sm:inline text-zinc-500">-</span>

            <div className="relative flex items-center">
              <div className="absolute left-3 z-10 text-zinc-400 pointer-events-none">
                <Calendar className="h-4 w-4" />
              </div>
              <Input
                type="date"
                value={endDate}
                className={twMerge(
                  "pl-10 w-full sm:w-50 bg-white/10 border-white/20 text-white placeholder:text-zinc-400 focus:ring-zinc-400",
                  // Filter to invert the native browser date picker icon to white
                  "[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert",
                )}
                onChange={(e) => onEndDateChange?.(e.target.value)}
                aria-label="End Date"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
