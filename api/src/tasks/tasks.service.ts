import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from '../tasks/entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create(createTaskDto);
    return this.taskRepository.save(task);
  }

  // async findAll(page: number = 1, limit: number = 10): Promise<Task[]> {
  //   return this.taskRepository.find({
  //     skip: (page - 1) * limit,
  //     take: limit,
  //   });
  // }
  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: 'in progress' | 'completed',
  ): Promise<Task[]> {
    const query = this.taskRepository.createQueryBuilder('task');

    if (status) {
      query.where('task.status = :status', { status });
    }

    return query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  async findOne(id: string): Promise<Task> {
    const response = await this.taskRepository.findOneBy({ id });
    return response;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    await this.taskRepository.update(id, updateTaskDto);
    const updatedTask = await this.taskRepository.findOneBy({ id });
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return updatedTask;
  }

  async remove(id: string): Promise<void> {
    const result = await this.taskRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
