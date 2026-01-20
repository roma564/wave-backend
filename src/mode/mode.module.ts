import { Module } from '@nestjs/common';
import { ModeService } from './mode.service';
import { ModeController } from './mode.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ModeController],
  providers: [ModeService, PrismaService],
})
export class ModeModule {}
