import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CarDocument = HydratedDocument<Car>;

@Schema({
  timestamps: true,
  optimisticConcurrency: true,
})
export class Car {
  @Prop({ required: true, trim: true })
  brand!: string;

  @Prop({ required: true, trim: true })
  carModel!: string;

  @Prop({ required: true })
  year!: number;

  @Prop({ required: true, trim: true })
  color!: string;

  @Prop({ required: true, min: 1 })
  seat!: number;

  @Prop({ required: true, min: 0 })
  basePrice!: number;

  @Prop({ required: true, min: 0 })
  stock!: number;

  @Prop({ required: true, min: 0 })
  availableStock!: number;

  @Prop({ default: true })
  isAvailable!: boolean;

  @Prop({ default: [] })
  imgUrl?: string[];
}

export const CarSchema = SchemaFactory.createForClass(Car);

CarSchema.index({ brand: 1, carModel: 1 }, { name: 'idx_car_brand_model' });
