import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room, RoomDocument } from './schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
  ) {}

  async create(createRoomDto: CreateRoomDto, userId: string): Promise<Room> {
    const { name, description, isPrivate = false, maxMembers = 10 } = createRoomDto;

    // Check if room name already exists
    const existingRoom = await this.roomModel.findOne({ name });
    if (existingRoom) {
      throw new ConflictException('Room name already exists');
    }

    const newRoom = new this.roomModel({
      name,
      description,
      createdBy: new Types.ObjectId(userId),
      members: [new Types.ObjectId(userId)],
      admins: [new Types.ObjectId(userId)],
      isPrivate,
      maxMembers,
    });

    return newRoom.save();
  }

  async findAll(): Promise<Room[]> {
    return this.roomModel
      .find({ isActive: true })
      .populate('createdBy', 'username')
      .populate('members', 'username')
      .populate('admins', 'username')
      .exec();
  }

  async findById(id: string): Promise<Room> {
    const room = await this.roomModel
      .findById(id)
      .populate('createdBy', 'username')
      .populate('members', 'username')
      .populate('admins', 'username')
      .exec();

    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  async findByUser(userId: string): Promise<Room[]> {
    return this.roomModel
      .find({
        members: new Types.ObjectId(userId),
        isActive: true,
      })
      .populate('createdBy', 'username')
      .populate('members', 'username')
      .populate('admins', 'username')
      .exec();
  }

  async update(id: string, updateRoomDto: UpdateRoomDto, userId: string): Promise<Room> {
    const room = await this.findById(id);
    
    // Check if user is admin (handle both populated and unpopulated cases)
    const isAdmin = room.admins.some((admin) => {
      if (typeof admin === 'string') {
        return admin === userId;
      } else {
        return admin._id.toString() === userId;
      }
    });
    
    if (!isAdmin) {
      throw new ForbiddenException('Only admins can update room');
    }

    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(id, updateRoomDto, { new: true })
      .populate('createdBy', 'username')
      .populate('members', 'username')
      .populate('admins', 'username')
      .exec();

    if (!updatedRoom) {
      throw new NotFoundException('Room not found');
    }
    return updatedRoom;
  }

  async joinRoom(roomId: string, userId: string): Promise<Room> {
    const room = await this.findById(roomId);
    
    // Check if user is already a member (handle both populated and unpopulated cases)
    const isAlreadyMember = room.members.some((member) => {
      if (typeof member === 'string') {
        return member === userId;
      } else {
        return member._id.toString() === userId;
      }
    });
    
    if (isAlreadyMember) {
      throw new ConflictException('User is already a member of this room');
    }

    // Check if room is full
    if (room.members.length >= room.maxMembers) {
      throw new ConflictException('Room is full');
    }

    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(
        roomId,
        {
          $addToSet: { members: new Types.ObjectId(userId) },
          lastActivity: new Date(),
        },
        { new: true }
      )
      .populate('createdBy', 'username')
      .populate('members', 'username')
      .populate('admins', 'username')
      .exec();

    if (!updatedRoom) {
      throw new NotFoundException('Room not found');
    }

    return updatedRoom;
  }

  async leaveRoom(roomId: string, userId: string): Promise<Room> {
    const room = await this.findById(roomId);
    
    // Check if user is a member (handle both populated and unpopulated cases)
    const isMember = room.members.some((member) => {
      if (typeof member === 'string') {
        return member === userId;
      } else {
        return member._id.toString() === userId;
      }
    });
    
    if (!isMember) {
      throw new ConflictException('User is not a member of this room');
    }

    // Remove user from members and admins
    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(
        roomId,
        {
          $pull: {
            members: new Types.ObjectId(userId),
            admins: new Types.ObjectId(userId),
          },
          lastActivity: new Date(),
        },
        { new: true }
      )
      .populate('createdBy', 'username')
      .populate('members', 'username')
      .populate('admins', 'username')
      .exec();

    if (!updatedRoom) {
      throw new NotFoundException('Room not found');
    }

    return updatedRoom;
  }

  async addAdmin(roomId: string, userId: string, adminUserId: string): Promise<Room> {
    const room = await this.findById(roomId);
    
    // Check if user is admin
    if (!room.admins.some((admin) => admin.toString() === userId)) {
      throw new ForbiddenException('Only admins can add other admins');
    }

    // Check if target user is a member
    if (!room.members.some((member) => member.toString() === adminUserId)) {
      throw new ConflictException('User must be a member to become admin');
    }

    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(
        roomId,
        {
          $addToSet: { admins: new Types.ObjectId(adminUserId) },
          lastActivity: new Date(),
        },
        { new: true }
      )
      .populate('createdBy', 'username')
      .populate('members', 'username')
      .populate('admins', 'username')
      .exec();

    if (!updatedRoom) {
      throw new NotFoundException('Room not found');
    }

    return updatedRoom;
  }

  async remove(id: string, userId: string): Promise<void> {
    const room = await this.findById(id);
    
    // Check if user is admin
    if (!room.admins.some(admin => admin.toString() === userId)) {
      throw new ForbiddenException('Only admins can delete room');
    }

    const result = await this.roomModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Room not found');
    }
  }
} 