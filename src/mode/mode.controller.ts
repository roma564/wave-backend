import { Controller, Get, Param, Post, Body, Patch } from '@nestjs/common';
import { ModeService } from './mode.service';
import { CreateModeDto } from './dto/create-mode.dto';
import { UpdateThemeDto } from './dto/update-theme.dto';

@Controller('mode')
export class ModeController {
  constructor(private readonly modeService: ModeService) {}

  @Get('user/:id')
  getUserModes(@Param('id') id: string) {
    return this.modeService.getUserModes(+id);
  }

  @Post('user/:id')
  createModeForUser(@Param('id') id: string, @Body() dto: CreateModeDto) {
    return this.modeService.createModeForUser(+id, dto);
  }

  @Patch(':modeId/add-chat/:chatId')
  addChatToMode(
    @Param('modeId') modeId: string,
    @Param('chatId') chatId: string
  ) {
    return this.modeService.addChatToMode(+modeId, +chatId);
  }

  @Get(':modeId/chats')
  getChatsByMode(@Param('modeId') modeId: string) {
    return this.modeService.getChatsByMode(+modeId);
  }

  @Get(':id/quick-messages')
  getQuickMessages(@Param('id') id: string) {
    return this.modeService.getQuickMessages(+id);
  }
  
  @Patch(':id/quick-messages')
  updateQuickMessages(
    @Param('id') id: string,
    @Body('messages') messages: string[],
  ) {
    return this.modeService.updateQuickMessages(+id, messages);
  }




  @Patch(':modeId/set-theme')
  async setTheme(
    @Param('modeId') modeId: string,
    @Body() dto: UpdateThemeDto
  ) {
    return this.modeService.setTheme(+modeId, dto.theme);
  }

  





}
