import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto, @Request() req: { user: AuthenticatedUser }) {
    return this.roomsService.create(createRoomDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get('my-rooms')
  findMyRooms(@Request() req: { user: AuthenticatedUser }) {
    return this.roomsService.findByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.roomsService.update(id, updateRoomDto, req.user.id);
  }

  @Post(':id/join')
  joinRoom(@Param('id') id: string, @Request() req: { user: AuthenticatedUser }) {
    return this.roomsService.joinRoom(id, req.user.id);
  }

  @Post(':id/leave')
  leaveRoom(@Param('id') id: string, @Request() req: { user: AuthenticatedUser }) {
    return this.roomsService.leaveRoom(id, req.user.id);
  }

  @Post(':id/admins/:userId')
  addAdmin(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.roomsService.addAdmin(id, req.user.id, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: { user: AuthenticatedUser }) {
    return this.roomsService.remove(id, req.user.id);
  }
} 