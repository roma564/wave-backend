import { Injectable } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class MeetingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateMeetingDto) {
  return this.prisma.meeting.create({
    data: {
      title: dto.title,
      startDate: new Date(dto.startDate),
      owner: {
        connect: { id: dto.ownerId },
      },
      invited_users: {
        connect: dto.invitedUserIds.map((id) => ({ id })),
      },
    },
    include: {
      owner: true,
      invited_users: true,
    },
  });
}


  async findAll() {
    return this.prisma.meeting.findMany({
      include: {
        owner: true,
        invited_users: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.meeting.findUnique({
      where: { id },
      include: {
        owner: true,
        invited_users: true,
      },
    });
  }

  async update(id: number, dto: UpdateMeetingDto) {
  return this.prisma.meeting.update({
    where: { id },
    data: {
      title: dto.title,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      ownerId: dto.ownerId !== undefined ? Number(dto.ownerId) : undefined,
      invited_users: dto.invitedUserIds
        ? {
            set: dto.invitedUserIds.map((uid) => ({ id: Number(uid) })),
          }
        : undefined,
    },
    include: {
      owner: true,
      invited_users: true,
    },
  });
}


  async remove(id: number) {
    return this.prisma.meeting.delete({
      where: { id },
    });
  }

  async findAllForUser(userId: number) {
  return this.prisma.meeting.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { invited_users: { some: { id: userId } } },
      ],
    },
    include: {
      owner: true,
      invited_users: true,
    },
  });
}
}
