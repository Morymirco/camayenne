export type Comment = {
  id: number;
  userId: string;
  locationId: number;
  text: string;
  rating: number;
  createdAt: string;
  userName: string;
}

export type Location = {
  id: number;
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  openingHours: string;
  latitude: number;
  longitude: number;
  image?: string;
  rating?: number;
  comments?: Comment[];
  favorites?: string[]; // Array of userIds
} 