import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.getById(+id);
  }
  
  @Get('chat/:chatId')
  findUsersByChat(@Param('chatId') chatId: string) {
    return this.userService.findUsersByChatId(+chatId);
  }

  @Patch(':id/avatar')
  async updateAvatar(
    @Param('id') id: string,
    @Body('avatarUrl') avatarUrl: string,
  ) {
    if (!avatarUrl) {
      throw new BadRequestException('avatarUrl is required');
    }
    return this.userService.updateAvatar(id, avatarUrl);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
