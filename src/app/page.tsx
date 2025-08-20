import { getRequests } from "@/lib/requests-store";
import { MainPage } from "@/components/main-page";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const requests = getRequests();
  return <MainPage requests={requests} />;
}
