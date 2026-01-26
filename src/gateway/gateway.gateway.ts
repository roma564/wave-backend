import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer } from '@nestjs/websockets';
import { GatewayService } from './gateway.service';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { ChatService } from '../chat/chat.service';

import { MessageService } from '../message/message.service';
import { Server } from 'socket.io';
import { MessageType } from '../types/MessageType';
import { UserService } from '../user/user.service';
import { Logger } from '@nestjs/common';


interface StartCallPayload {
  callId: string;
  callerId: number;
  chatId: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true, 
  },
})
export class Gateway {
  constructor(private readonly gatewayService: GatewayService,
    private chatService: ChatService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

   @WebSocketServer()
    server: Server

  private readonly logger = new Logger(Gateway.name);



  @SubscribeMessage('createChat')
  createChat(@MessageBody() data: string) {
    try {
            const jsonData = JSON.parse(data);
            // Now you can work with the jsonData object
            console.log(jsonData);
            
           

            return this.chatService.create(jsonData);

            
        } catch (e) {
            console.error("Failed to parse JSON:", e);
            
        }

  }




        @SubscribeMessage('createMessage')
        async createMessage(@MessageBody() data: any) {


          try {
            const createdMessage = await this.messageService.create({
            type: data.type, // ← обов’язково
            chatId: Number(data.chatId),
            userId: Number(data.userId),
            content: data.content ?? null,
            fileUrl: data.fileUrl ?? null,
            fileName: data.fileName ?? null,
            savedFileName: data.savedFileName ?? null,
            fileSize: data.fileSize ?? null,
            mimeType: data.mimeType ?? null,
          });



            this.server.emit(String(data.chatId), createdMessage);

            return createdMessage;
          } catch (e) {
            console.error('Failed to create message:', e);
            throw e;
          }
        }





        @SubscribeMessage('startCall')
        async startCall(@MessageBody() data: StartCallPayload) {
          const { callId, callerId, chatId } = data;

          // отримуємо користувачів через сервіс
          const users = await this.userService.findUsersByChatId(chatId);
          const userIds = users.map(u => u.id);

          // видаляємо автора дзвінка
          const recipients = userIds.filter(uid => uid !== callerId);

          console.log('[startCall] recipients:', data, userIds);

          // розсилаємо повідомлення кожному користувачу, крім автора
          recipients.forEach(uid => {
            console.log(`call-user-${uid}`);

            this.server.emit(`call-user-${uid}`, {
              callId,
              callerId,
              type: 'CALL_REQUEST',
            });
          });


          return { status: 'ok', callId };
        }











  @SubscribeMessage('findAllGateway')
  findAll() {
    return this.gatewayService.findAll();
  }

  @SubscribeMessage('findOneGateway')
  findOne(@MessageBody() id: number) {
    return this.gatewayService.findOne(id);
  }

  @SubscribeMessage('updateGateway')
  update(@MessageBody() updateGatewayDto: UpdateGatewayDto) {
    return this.gatewayService.update(updateGatewayDto.id, updateGatewayDto);
  }

  @SubscribeMessage('removeGateway')
  remove(@MessageBody() id: number) {
    return this.gatewayService.remove(id);
  }
}
