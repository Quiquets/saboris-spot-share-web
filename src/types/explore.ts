
export interface ReviewerInfo {
  userId: string;
  userName: string;
  avatarUrl?: string; // Add this missing property
  photoUrls: string[];
  ratingOverall: number;
  ratingValue?: number;
  ratingAtmosphere?: number;
  reviewText?: string;
}

export interface ExplorePlace {
  placeId: string;
  name: string;
  category?: string;
  location: { lat: number; lng: number };
  reviewers: ReviewerInfo[];
  avgOverall: number;
  avgValue?: number;
  avgAtmosphere?: number;
}
