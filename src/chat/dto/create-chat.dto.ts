import { Optional } from "@nestjs/common";
import { ArrayNotEmpty, IsArray, IsInt, IsString } from "class-validator"
import { CreateUserDto } from "src/user/dto/create-user.dto";


export class CreateChatDto {
  subject?: string;
  userIds: number[]; 
}
