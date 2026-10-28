import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { UserDocument } from '../models/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly SALT_ROUNDS = 10;

  constructor(private userRepository: UserRepository) {}

  public async validateCredentials(
    username: string,
    password: string,
  ): Promise<UserDocument | null> {
    const user = await this.userRepository.findOne({ username });
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  public async create(data: any): Promise<UserDocument> {
    const password = data.password
      ? await bcrypt.hash(data.password, this.SALT_ROUNDS)
      : undefined;

    return await this.userRepository.create({
      ...data,
      password,
    });
  }

  public async update(id: string, updateData: any): Promise<UserDocument> {
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.password = await bcrypt.hash(
        updateData.password,
        this.SALT_ROUNDS,
      );
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found to delete`);
    }
    return result;
  }

  public findAll = () => this.userRepository.findAll();

  public findOneById = (id: string) => this.userRepository.findOneById(id);

  public findOne = (filter: any) => this.userRepository.findOne(filter);

  public findUserByEmail = (email: string) =>
    this.userRepository.findOne({ email });
}
