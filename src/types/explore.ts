export interface ReviewerInfo {
  userId: string;
  userName: string;
  photoUrls: string[];
  ratingOverall: number;
  ratingValue?: number;
  ratingAtmosphere?: number;
  reviewText?: string; // Add this line
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
