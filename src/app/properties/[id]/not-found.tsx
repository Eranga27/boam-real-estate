import { ListingGone } from '@/components/listing-detail/ListingGone';

/** 404 for deleted listings (a real 404 status, so search engines drop them) */
export default function ListingNotFound() {
  return <ListingGone />;
}
