import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Topic, User } from 'generated/prisma';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { EditTopicDto } from './dto/edit-topic.dto';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';


@ApiBearerAuth()
@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  // GET: /topics/:id
  @ApiOperation({ summary: 'Get a topic by ID' })
  @ApiParam({ name: 'id', description: 'ID of the topic' , example: '3f92a5df-09d9-4ae1-ab99-421c7da12ac9'})
  @Get(':id')
  async getTopic(
    @Param('id') topicId: string,
    @CurrentUser() user: User
  ) : Promise<Topic> {
    return this.topicsService.getTopic(topicId, user.id);
  }

  // GET: /topics/class/:id
  @ApiOperation({ summary: 'Get all topics for a class' })
  @ApiParam({ name: 'id', description: 'ID of the class' , example: '3f92a5df-09d9-4ae1-ab99-421c7da12ac9'})
  @Get('class/:id')
  async getTopics(
    @Param('id') classId: string,
    @CurrentUser() user: User
  ) : Promise<Topic[]> {
    return this.topicsService.getTopics(classId, user.id);
  }

  // POST: /topics/class/:id
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiParam({ name: 'id', description: 'ID of the class' , example: '3f92a5df-09d9-4ae1-ab99-421c7da12ac9'})
  @Post('class/:id')
  async createTopic(
    @Body() createTopicDto: CreateTopicDto, 
    @Param('id') classId: string,
    @CurrentUser() user: User
  ) : Promise<Topic> {
    return this.topicsService.createTopic(createTopicDto, classId, user.id);
  }

  // PATCH: /topics/:id
  @ApiOperation({ summary: 'Edit an existing topic' })
  @ApiParam({ name: 'id', description: 'ID of the topic' , example: '3f92a5df-09d9-4ae1-ab99-421c7da12ac9'})
  @Patch(':id')
  async editTopic(
    @Param('id') topicId: string,
    @Body() editTopicDto: EditTopicDto,
    @CurrentUser() user: User
  ) : Promise<Topic> {
    return this.topicsService.editTopic(topicId, editTopicDto, user.id);
  }

  // DELETE: /topics/:id
  @ApiOperation({ summary: 'Delete a topic by ID' })
  @ApiParam({ name: 'id', description: 'ID of the topic' , example: '3f92a5df-09d9-4ae1-ab99-421c7da12ac9'})
  @Delete(':id')
  async deleteTopic(
    @Param('id') topicId: string,
    @CurrentUser() user: User
  ): Promise<Topic> {
    return this.topicsService.deleteTopic(topicId, user.id);
  }
}
