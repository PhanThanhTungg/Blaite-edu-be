import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Topic, User } from 'generated/prisma';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { EditTopicDto } from './dto/edit-topic.dto';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  // GET: /topics/:id
  @Get(':id')
  async getTopic(
    @Param('id') topicId: string,
    @CurrentUser() user: User
  ) : Promise<Topic> {
    return this.topicsService.getTopic(topicId, user.id);
  }

  // GET: /topics
  @Get()
  async getTopics(
    @CurrentUser() user: User
  ) : Promise<Topic[]> {
    return this.topicsService.getTopics(user.id);
  }

  // POST: /topics
  @Post()
  async createTopic(
    @Body() createTopicDto: CreateTopicDto, 
    @CurrentUser() user: User
  ) : Promise<Topic> {
    return this.topicsService.createTopic(createTopicDto, user.id);
  }

  // PATCH: /topics/:id
  @Patch(':id')
  async editTopic(
    @Param('id') topicId: string,
    @Body() editTopicDto: EditTopicDto,
    @CurrentUser() user: User
  ) : Promise<Topic> {
    return this.topicsService.editTopic(topicId, editTopicDto, user.id);
  }

  // DELETE: /topics/:id
  @Delete(':id')
  async deleteTopic(
    @Param('id') topicId: string,
    @CurrentUser() user: User
  ): Promise<Topic> {
    return this.topicsService.deleteTopic(topicId, user.id);
  }
}
