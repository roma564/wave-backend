import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { Gateway } from './gateway.gateway';
import { ChatService } from 'src/chat/chat.service';
import { PrismaService } from 'src/prisma.service';
import { ChatController } from 'src/chat/chat.controller';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';

@Module({
  providers: [Gateway, GatewayService, ChatService, PrismaService, MessageService, UserService],
})
export class GatewayModule {}
