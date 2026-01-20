import { IsInt, IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { MessageType } from 'src/types/MessageType';

export class UpdateMessageDto {
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsInt()
  chatId?: number;

  @IsOptional()
  @IsInt()
  userId?: number;

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
  @IsInt()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;
}
