import { IsInt, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { MessageType } from 'src/types/MessageType';



export class CreateMessageDto {
  @IsEnum(MessageType)
  type: MessageType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsInt()
  chatId: number;

  @IsInt()
  userId: number;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  savedFileName?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;
}
