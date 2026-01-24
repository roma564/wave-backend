import { Body, Injectable, Post, Res, UnauthorizedException } from '@nestjs/common';
import { GooglePayload } from './google/google-payload.type';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { User } from './types/User'; 
import * as bcrypt from 'bcrypt';

// import { BadRequestException, Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';
// // import { User } from '../users/users.entity';
// import { AccessToken } from './types/AccessToken';
// import { UsersService } from '../users/users.service';
// import { RegisterRequestDto } from './dtos/register-request.dto';



@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService,
    private jwtService: JwtService
  ) {}

  

async manageGoogleUser(profile: GooglePayload, @Res({ passthrough: true }) res: Response): Promise<User> {
  const email = profile.emails?.[0]?.value;
  // const avatar = profile.photos?.[0]?.value || null;

  const user = await this.userService.create({
    name: profile.displayName,
    lastname: profile.name.familyName,
    email,
    avatar: profile.photos?.[0]?.value ?? undefined,
  });

  res.cookie('id', user.id);
  res.cookie('username', user.name);
  res.cookie('lastname', user.lastname);
  res.cookie('email', user.email);
  res.cookie('avatar', user.avatar ?? '');

  return user;
}



  async validateUser(username: string, password: string): Promise<User | null>{
     const user = await this.userService.findByUsername(username);
      if (!user) return null;

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return null;

      return user;
    }

    //   async login(user: User) {
    //   const payload = { username: user.name, sub: user.id };
    //   return {
    //   access_token: this.jwtService.sign(payload),
    //   };
    // }

async signIn(username: string, password: string): Promise<{ access_token: string; user: User }> {
  const user = await this.userService.findByUsername(username);
  if (!user || user.password !== password) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const payload = { sub: user.id, username: user.name };
  const access_token = await this.jwtService.signAsync(payload);

  return { access_token, user };
}










  

}