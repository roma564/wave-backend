import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingService } from './meeting.service';
import { StreamClient } from '@stream-io/node-sdk';


// const stream = new StreamClient(
//   process.env.STREAM_API_KEY!,
//   process.env.STREAM_SECRET_KEY!
// );

@Controller('meeting')
export class MeetingController {
  constructor(private readonly meetingService: MeetingService) {}

  
 @Post()
  async create(@Body() createMeetingDto: CreateMeetingDto) {
    const meeting = await this.meetingService.create(createMeetingDto);

    // await stream.video.getOrCreateCall({
    //   type: 'default',
    //   id: meeting.id.toString(),
    //   data: {
    //     starts_at: new Date(createMeetingDto.startDate),
    //     custom: { title: createMeetingDto.title },
    //   },
    // });

    // return meeting;
  }

  @Get()
  findAll() {
    return this.meetingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingService.findOne(+id);
  }

  @Get('user/:userId')
  findAllForUser(@Param('userId') userId: string) {
    return this.meetingService.findAllForUser(Number(userId));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMeetingDto: UpdateMeetingDto) {
    return this.meetingService.update(+id, updateMeetingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingService.remove(+id);
  }
}
