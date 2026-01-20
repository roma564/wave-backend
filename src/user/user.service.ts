import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma.service';
import { User } from 'generated/prisma';
import { defaultModes } from '../mode/defaultModes/defaultModes';


@Injectable()
export class UserService {
  constructor(private prisma: PrismaService){}

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({ data: dto });



    for (const mode of defaultModes) {
      await this.prisma.mode.create({
        data: {
          ...mode,
          userId: user.id,
        },
      });
    }

    return user;
  }

    async getById(id: number){
          const user = await this.prisma.user.findUnique({
              where: {
                  id
              }
          })

          return user
  }

  async findAll(){
    return this.prisma.user.findMany()
  }


  async remove(id: number) {
    await this.prisma.user.delete({
      where: {
        id
      },
    })
  }

  async findUsersByChatId(chatId: number): Promise<User[]> {
  return this.prisma.user.findMany({
    where: {
      chats: {
        some: {
          id: chatId,
        },
      },
    },
  });
}

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id: Number(userId) },
      data: { avatar: avatarUrl },
    });
  }

  async findByUsername(identifier: string): Promise<User | null> {
  return this.prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { name: identifier },
      ],
    },

    
  




    
  });

  


}

}
