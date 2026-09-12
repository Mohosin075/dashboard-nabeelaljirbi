export interface Shoe {
  id: string;
  P_ID: string;
  brand: string;
  brandIcon: string | null;
  model: string;
  price: number;
  categoryId: string;
  subCategory: string[];
  stability: string[];
  cushion: string[];
  fit: string[];
  heelStack: number;
  foreFootStack: number;
  midsoleDrop: number;
  weight: number;
  plate: string[];
  plateDescription: string;
  description: string;
  images: string[];
  cardImage: string;
  viewLink: string;
  note: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'INACTIVE';
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  foamType: string[];
  isNew: boolean;
  category: {
    id: string;
    CA_ID: string;
    name: string;
    image: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
}
