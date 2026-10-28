import { IBaseRepository } from '@core/interfaces';
import { Model, Document, UpdateQuery, QueryFilter, Types } from 'mongoose';

export abstract class BaseRepository<
  T extends Document,
> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const createdEntity = new this.model(data);
    return await createdEntity.save();
  }

  async findAll(): Promise<T[]> {
    return await this.model.find().exec();
  }

  async findOneById(id: string | Types.ObjectId): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findOne(filter: QueryFilter<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: UpdateQuery<T>,
  ): Promise<T | null> {
    return await this.model
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return Boolean(result);
  }
}
