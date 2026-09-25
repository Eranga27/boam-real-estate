import { fetchLivePropertiesList } from '@/lib/api';
import { toFeaturedCards } from '@/lib/featured';
import HomeClient from './HomeClient';

// Enable Next.js ISR so featured listings are pre-rendered from the live database
export const revalidate = 60;

export default async function HomePage() {
  let initialFeatured: any[] = [];
  try {
    initialFeatured = toFeaturedCards(await fetchLivePropertiesList());
  } catch (err) {
    // If server fetch times out or backend is cold, the client fetch takes over seamlessly
    console.warn('Server pre-fetch skipped (client will fetch):', err);
  }

  return <HomeClient initialFeatured={initialFeatured} />;
}
