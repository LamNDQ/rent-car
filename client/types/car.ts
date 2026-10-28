export interface Car {
  _id?: string;
  brand: string;
  carModel: string;
  year: number;
  color: string;
  seat: number;
  basePrice: number;
  stock: number;
  availableStock: number;
  isAvailable: boolean;
  imgUrl?: string[];
}