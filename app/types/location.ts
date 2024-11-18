export type Comment = {
  id: string;
  userId: string;
  userName: string;
  text: string;
  rating: number;
  createdAt: string;
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
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
} 