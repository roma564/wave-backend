import { Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { GooglePayload } from './google-payload.type';
import { response } from 'express';
import { UserService } from 'src/user/user.service';
import { User } from '../types/User';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  // For more details see:  https://developers.google.com/identity/protocols/oauth2/web-server#httprest_1
  constructor(private readonly authService: AuthService,
    private userService: UserService
  ) {
    super({
      clientID: process.env['AUTH_GOOGLE_KEY'],
      clientSecret: process.env['AUTH_GOOGLE_SECRET'],
      callbackURL: process.env['GOOGLE_CALLBACK_URL'],
      passReqToCallback: true,
      scope: ['profile', 'email'],
      accessType: 'offline',
      prompt: 'consent',
    });
  }

  async validate(
  req: any,
  accessToken: string,
  refreshToken: string,
  profile: GooglePayload,
): Promise<User> {
  const email = profile.emails?.[0]?.value;
  if (!email) throw new UnauthorizedException('Email not found');

  let user = await this.userService.findByUsername(email);

  if (!user) {
    user = await this.userService.create({
      name: profile.displayName,
      lastname: profile.name.familyName,
      email,
      password: null,
      avatar: profile.photos?.[0]?.value || '',
    });
    if (!user) throw new UnauthorizedException('User creation failed');
  }

  return user;
}

  
   
    
}
