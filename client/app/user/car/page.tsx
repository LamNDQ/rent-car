import { CarSection } from "./_component/CarSection";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const { startDate = "", endDate = "" } = await searchParams;

  return <CarSection startDate={startDate} endDate={endDate} />;
}
