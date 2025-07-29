import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { KnowledgesService } from './knowledges.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { Knowledge } from 'generated/prisma';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@clerk/express';
import { EditKnowledgeDto } from './dto/edit.knowledge.dto';

@UseGuards(JwtAuthGuard)
@Controller('knowledges')
export class KnowledgesController {
  constructor(private readonly knowledgesService: KnowledgesService) {}
  

  // GET /knowledges/detail/:id
  @Get('detail/:id')
  async getOneKnowledge(
    @Param('id') knowledgeId: string,
    @CurrentUser() user: User
  ): Promise<Knowledge> {
    return this.knowledgesService.getOneKnowledge(knowledgeId, user.id);
  }

  // GET /knowledges/topic/:id
  @Get('topic/:id')
  async getKnowledgesOfTopic(
    @Param('id') topicId: string,
    @CurrentUser() user: User
  ): Promise<Knowledge[]> {
    return this.knowledgesService.getKnowledgesOfTopic(topicId, user.id);
  }

  // POST /knowledges
  @Post()
  async createKnowledge(
    @Body() createKnowledgeDto: CreateKnowledgeDto,
    @CurrentUser() user: User
  ): Promise<Knowledge> {
    return this.knowledgesService.createKnowledge(createKnowledgeDto, user.id);
  }

  // PATCH /knowledges/:id
  @Patch(':id')
  async editKnowledge(
    @Param('id') knowledgeId: string,
    @Body() editKnowledgeDto: EditKnowledgeDto,
    @CurrentUser() user: User
  ): Promise<Knowledge> {
    return this.knowledgesService.editKnowledge(editKnowledgeDto, knowledgeId, user.id);
  }

  // DELETE /knowledges/:id
  @Delete(':id')
  async deleteKnowledge(
    @Param('id') knowledgeId: string,
    @CurrentUser() user: User
  ): Promise<Knowledge> {
    return this.knowledgesService.deleteKnowledge(knowledgeId, user.id);
  }

  

}
