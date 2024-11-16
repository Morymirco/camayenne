export type Comment = {
  id: string;
  userId: string;
  locationId: string;
  text: string;
  rating: number;
  createdAt: string;
  userName: string;
}

export type Location = {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  openingHours: string;
  latitude: number;
  longitude: number;
  image?: string;
  gallery?: string[];
  rating?: number;
  comments?: Comment[];
  favorites?: string[];
} 