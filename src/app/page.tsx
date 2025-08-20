// src/app/page.tsx
import { getRequests } from "@/lib/requests-store";
import { MainPage } from "@/components/main-page";

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Add 'await' here
  const requests = await getRequests();
  return <MainPage requests={requests} />;
}