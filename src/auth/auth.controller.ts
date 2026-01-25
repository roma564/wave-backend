import { Body, Controller, Get, Post, Req, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleOAuth2Guard } from './google/google-oauth.guard';
import { Response } from 'express';
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
    async callbackGoogle(@Req() req, @Res({ passthrough: true }) res: Response) {
      const user = req.user;


      const payload = { sub: user.id, username: user.name };
      const access_token = await this.jwtService.signAsync(payload);


      res.cookie('access_token', access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        domain: '.vercel.app',
        maxAge: 3600000,
      });


      res.cookie('id', user.id);
      res.cookie('username', user.name);
      res.cookie('lastname', user.lastname);
      res.cookie('email', user.email);
      res.cookie('avatar', user.avatar);

      res.redirect(`${process.env['FRONTEND_URL']}`);
    }

    @Post('register')
    async register(@Res({ passthrough: true }) response: Response, @Body() body: CreateUserDto) {

      const user = await this.userService.create(body);

      const payload = { sub: user.id, username: user.name };
      const access_token = await this.jwtService.signAsync(payload);


      response.cookie('access_token', access_token, {
        httpOnly: false,
        secure: true,
        sameSite: 'strict',
        maxAge: 3600000,
      });


      response.cookie('id', user.id);
      response.cookie('username', user.name);
      response.cookie('lastname', user.lastname);
      response.cookie('email', user.email);
      response.cookie('avatar', user.avatar ?? '');

      return { 
        message: 'Registered successfully' ,
        redirectUrl: process.env.FRONTEND_URL,
      };
    }



   




@Post('login')
async login(
  @Res({ passthrough: true }) response: Response,
  @Body() body: LoginDto,
) {
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
  //TODO for each method
  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production', // обов’язково для HTTPS
    sameSite: 'none' as const,                     // дозволяє крос-домен
    httpOnly: true,                                // захист від XSS
    maxAge: 60 * 60 * 1000,
  };


  response.cookie('access_token', access_token, { ...cookieOptions });
  response.cookie('stream_token', stream_token, { ...cookieOptions, httpOnly: false });
  response.cookie('id', user.id, { ...cookieOptions, httpOnly: false });
  response.cookie('username', user.name, { ...cookieOptions, httpOnly: false });
  response.cookie('lastname', user.lastname, { ...cookieOptions, httpOnly: false });
  response.cookie('email', user.email, { ...cookieOptions, httpOnly: false });
  response.cookie('avatar', user.avatar, { ...cookieOptions, httpOnly: false });

  // Явно відправляємо JSON-відповідь
 return { message: 'Logged in successfully', redirectUrl: `${process.env.FRONTEND_URL}/chat`, };
}



  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
