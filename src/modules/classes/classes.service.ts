import { Injectable, NotFoundException } from '@nestjs/common';
import { Class, PrismaClient } from 'generated/prisma';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassesService {

  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllClasses(userId: string): Promise<Class[]> {
    const classes = await this.prisma.class.findMany({
      where: { userId },
    });
    return classes;
  }

  async getOneClass(classId: string, userId: string): Promise<Class> {
    const classFound = await this.prisma.class.findUnique({
      where: { id: classId, userId },
    });
    if (!classFound) {
      throw new NotFoundException('Class not found');
    }
    return classFound;
  }

  async createClass(createClassDto: CreateClassDto, userId: string): Promise<Class> {
    const newClass = await this.prisma.class.create({
      data: {
        ...createClassDto,
        userId,
      },
    });
    return newClass;
  }

  async updateClass(updateClassDto: UpdateClassDto, classId: string, userId: string): Promise<Class> {
    const updatedClass = await this.prisma.class.update({
      where: { id: classId, userId },
      data: updateClassDto,
    });
    return updatedClass;
  }

  async deleteClass(classId: string, userId: string): Promise<Class> {
    const deletedClass = await this.prisma.class.delete({
      where: { id: classId, userId },
    });
    return deletedClass;
  }
}
