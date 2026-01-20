import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { MessageService } from '../message/message.service';
import { ChatService } from '../chat/chat.service';
import { PrismaService } from '../prisma.service';
import { MessageModule } from '../message/message.module';
import { ChatModule } from '../chat/chat.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [MessageModule, ChatModule, MessageModule ], 
  controllers: [ UploadController],
  providers: [UploadService, UserService, PrismaService ]
})
export class UploadModule {}
