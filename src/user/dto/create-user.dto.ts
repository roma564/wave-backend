import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string | null

  @IsOptional()
  @IsString()
  avatar?: string;
}
