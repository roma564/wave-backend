import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { PrismaService } from 'src/prisma.service';
import { ChatService } from 'src/chat/chat.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, PrismaService, ChatService],
  exports:[MessageService]
})
export class MessageModule {}
