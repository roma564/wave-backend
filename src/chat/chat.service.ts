import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from '../prisma.service';
import { User } from 'generated/prisma';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService){}
  
    create(dto: CreateChatDto) {
    return this.prisma.chat.create({
      data: {
        subject: dto.subject,
        users: {
          connect: dto.userIds.map(id => ({ id })) 
        }
      },
    });
  }


  findAll() {
    return this.prisma.chat.findMany();
  }

  findOne(id: number) {
    return this.prisma.chat.findUnique({
      where:{
        id
      }
    });
  }

  findManyByIds(ids: number[]) {
  return this.prisma.chat.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
}


    findAllByUser(userId: number) {
    return this.prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: userId
          }
        }
      }
    });
  }

  async findUsersByChatId(chatId: number): Promise<User[]> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { users: true },
    });
    return chat?.users ?? [];
  }




  update( id: number,  updateDto: UpdateChatDto) {
    return this.prisma.chat.update({
    where: {
      id
    },
    data: {
      subject: updateDto.subject,
    },
  })
  }


  remove(id: number) {
    return this.prisma.chat.delete({
      where:{
        id
      }
    });
  }
}
