import { UpdateQuery, QueryFilter, Types } from 'mongoose';

export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findOneById(id: string | Types.ObjectId): Promise<T | null>;
  findOne(filter: QueryFilter<T>): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string | Types.ObjectId): Promise<boolean | null>;
}
