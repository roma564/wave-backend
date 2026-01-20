import { IsString, IsArray, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMeetingDto {
  @IsString()
  title: string;

  @Type(() => Number)
  @IsInt()
  ownerId: number;

  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  invitedUserIds: number[];

  @IsDateString()
  startDate: string;
}
