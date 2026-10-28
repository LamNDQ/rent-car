export interface ICar {
  id?: string;
  brand: string;
  carModel: string;
  year: number;
  seat: number;
  color: string;
  basePrice: number;
  availableStock: number;
  createdAt?: Date;
  updatedAt?: Date;
}
