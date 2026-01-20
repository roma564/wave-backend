import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';
import { GoogleStrategy } from './google/google.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/auth.constants';


@Module({
  imports:[  JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60s' },
    })],
  controllers: [AuthController],
  providers: [AuthService, UserService, PrismaService,GoogleStrategy,
  
  ],
})
export class AuthModule {}
