import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/common/guards/clerk-auth.guard';

@ApiBearerAuth()
@Controller('classes')
@UseGuards(ClerkAuthGuard)
export class ClassesController {

  constructor(private readonly classesService: ClassesService) {}

  // GET: /classes
  @ApiOperation({ summary: 'Get all classes' })
  @Get()
  async getAllClasses(@CurrentUser() user: User) {
    console.log("user", user);
    return this.classesService.getAllClasses(user.id);
  }

  // GET: /classes/:id
  @ApiOperation({ summary: 'Get one class' })
  @ApiParam({ name: 'id', description: 'The id of the class' })
  @Get(':id')
  async getOneClass(@Param('id') id: string, @CurrentUser() user: User) {
    return this.classesService.getOneClass(id, user.id);
  }

  // POST: /classes
  @ApiOperation({ summary: 'Create a class' })
  @Post()
  async createClass(
    @Body() createClassDto: CreateClassDto, 
    @CurrentUser() user: User
  ) {
    return this.classesService.createClass(createClassDto, user.id);
  }

  // PATCH: /classes/:id
  @ApiOperation({ summary: 'Update a class' })
  @ApiParam({ name: 'id', description: 'The id of the class' })
  @Patch(':id')
  async updateClass(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto, @CurrentUser() user: User) {
    return this.classesService.updateClass(updateClassDto, id, user.id);
  }

  // DELETE: /classes/:id
  @ApiOperation({ summary: 'Delete a class' })
  @ApiParam({ name: 'id', description: 'The id of the class' })
  @Delete(':id')
  async deleteClass(@Param('id') id: string, @CurrentUser() user: User) {
    return this.classesService.deleteClass(id, user.id);
  }
}
