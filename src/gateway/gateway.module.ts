import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { Gateway } from './gateway.gateway';
import { ChatService } from '../chat/chat.service';
import { PrismaService } from '../prisma.service';
import { ChatController } from '../chat/chat.controller';
import { MessageService } from '../message/message.service';
import { UserService } from '../user/user.service';

@Module({
  providers: [Gateway, GatewayService, ChatService, PrismaService, MessageService, UserService],
})
export class GatewayModule {}
