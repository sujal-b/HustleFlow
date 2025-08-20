// src/app/page.tsx
import { getRequests } from "@/app/actions"; // Changed import location
import { MainPage } from "@/components/main-page";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const requests = await getRequests();
  return <MainPage requests={requests} />;
}