import { Injectable, NotFoundException } from '@nestjs/common';
import { Class, PrismaClient } from '@prisma/client';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { ResponseClassDto } from './dto/response-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllClasses(userId: string): Promise<ResponseClassDto[]> {
    const classes = await this.prisma.class.findMany({
      where: { userId, deleted: false },
      select: {
        id: true,
        name: true,
        prompt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            topics: true,
          },
        },
        topics: {
          select: {
            _count: {
              select: {
                knowledges: true,
              },
            },
            knowledges: {
              select: {
                _count: {
                  select: {
                    questions: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const responseClasses = classes.map((classItem) => {
      const res: ResponseClassDto = {
        id: classItem.id,
        name: classItem.name,
        prompt: classItem.prompt,
        status: classItem.status,
        totalTopic: classItem._count.topics,
        totalKnowledge: classItem.topics.reduce(
          (acc, topic) => acc + topic._count.knowledges,
          0,
        ),
        totalQuestion: classItem.topics.reduce(
          (acc, topic) =>
            acc +
            topic.knowledges.reduce(
              (acc, knowledge) => acc + knowledge._count.questions,
              0,
            ),
          0,
        ),
      };
      return res;
    });
    return responseClasses;
  }

  async getOneClass(
    classId: string,
    userId: string,
  ): Promise<ResponseClassDto> {
    const classFound = await this.prisma.class.findUnique({
      where: { id: classId, userId, deleted: false },
      select: {
        id: true,
        name: true,
        prompt: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            topics: true,
          },
        },
        topics: {
          select: {
            _count: {
              select: {
                knowledges: true,
              },
            },
            knowledges: {
              select: {
                _count: {
                  select: {
                    questions: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!classFound) {
      throw new NotFoundException('Class not found');
    }

    const responseClass: ResponseClassDto = {
      id: classFound.id,
      name: classFound.name,
      prompt: classFound.prompt,
      status: classFound.status,
      totalTopic: classFound._count.topics,
      totalKnowledge: classFound.topics.reduce(
        (acc, topic) => acc + topic._count.knowledges,
        0,
      ),
      totalQuestion: classFound.topics.reduce(
        (acc, topic) =>
          acc +
          topic.knowledges.reduce(
            (acc, knowledge) => acc + knowledge._count.questions,
            0,
          ),
        0,
      ),
    };
    return responseClass;
  }

  async createClass(
    createClassDto: CreateClassDto,
    userId: string,
  ): Promise<Class> {
    const newClass = await this.prisma.class.create({
      data: {
        ...createClassDto,
        userId,
      },
    });
    return newClass;
  }

  async updateClass(
    updateClassDto: UpdateClassDto,
    classId: string,
    userId: string,
  ): Promise<Class> {
    const updatedClass = await this.prisma.class.update({
      where: { id: classId, userId, deleted: false },
      data: updateClassDto,
    });
    return updatedClass;
  }

  async deleteClass(classId: string, userId: string): Promise<Class> {
    const deletedClass = await this.prisma.class.update({
      where: { id: classId, userId, deleted: false },
      data: { deleted: true },
    });
    return deletedClass;
  }
}
