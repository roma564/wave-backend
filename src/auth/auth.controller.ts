import { Body, Controller, Get, Post, Req, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuth2Guard } from './google/google-oauth.guard';
import { CookieOptions, Response } from 'express';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guard/auth.guard';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { StreamClient } from '@stream-io/node-sdk';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
      private userService: UserService,
      private jwtService: JwtService
  ) {
  }

    @UseGuards(GoogleOAuth2Guard)
    @Get('login/google')
    async loginGoogle(@Request() _req) {
      console.log('login with google');
    }

    
    @UseGuards(GoogleOAuth2Guard)
    @Get('callback')
    async callbackGoogle(@Req() req, @Res() res: Response) {
      let user = req.user;

      // спробуємо знайти користувача в базі
      let existingUser = await this.userService.findByEmail(user.email);

      // якщо нема — створюємо
      if (!existingUser) {
        existingUser = await this.userService.create({
          name: user.name,
          lastname: user.lastname,
          email: user.email,
          avatar: user.avatar || '',
          // можеш додати інші поля, якщо треба
        });
      }

      // тепер працюємо з existingUser
      const payload = { sub: existingUser.id, username: existingUser.name };
      const access_token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      });

      const streamClient = new StreamClient(
        process.env.STREAM_API_KEY!,
        process.env.STREAM_SECRET_KEY!,
      );
      const stream_token = streamClient.createToken(String(existingUser.id));


      const cookieOptions: CookieOptions = {
        
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // ✅ нижній регістр
        path: '/',
      };

      res.cookie('access_token', access_token, cookieOptions);
      res.cookie('stream_token', stream_token, cookieOptions);
      res.cookie('id', String(existingUser.id), cookieOptions);
      res.cookie('username', existingUser.name, cookieOptions);
      res.cookie('lastname', existingUser.lastname, cookieOptions);
      res.cookie('email', existingUser.email, cookieOptions);
      res.cookie('avatar', existingUser.avatar || '', cookieOptions);

      return res.redirect(`${process.env.FRONTEND_URL}/chat`);


    }




    @Post('register')
    async register(@Body() body: CreateUserDto) {
      const user = await this.userService.create(body);

      const payload = { sub: user.id, username: user.name };
      const access_token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      });

      const streamClient = new StreamClient(
        process.env.STREAM_API_KEY!,
        process.env.STREAM_SECRET_KEY!,
      );
      const stream_token = streamClient.createToken(String(user.id));

      return {
        message: 'Registered successfully',
        redirectUrl: `${process.env.FRONTEND_URL}/chat`,
        tokens: {
          access_token,
          stream_token,
        },
        user: {
          id: user.id,
          username: user.name,
          lastname: user.lastname,
          email: user.email,
          avatar: user.avatar ?? '',
        },
      };
    }




   




  @Post('login')
  async login(@Body() body: LoginDto) {
    const { user } = await this.authService.signIn(body.username, body.password);

    const payload = { sub: user.id, username: user.name };
    const access_token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    const streamClient = new StreamClient(
      process.env.STREAM_API_KEY!,
      process.env.STREAM_SECRET_KEY!,
    );
    const stream_token = streamClient.createToken(String(user.id));


    return {
      message: 'Logged in successfully',
      redirectUrl: `${process.env.FRONTEND_URL}/chat`,
      tokens: {
        access_token,
        stream_token,
      },
      user: {
        id: user.id,
        username: user.name,
        lastname: user.lastname,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }




  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
