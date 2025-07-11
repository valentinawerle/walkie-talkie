export interface Room {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    username: string;
  };
  members: Array<{
    _id: string;
    username: string;
  }>;
  admins: Array<{
    _id: string;
    username: string;
  }>;
  isPrivate: boolean;
  maxMembers: number;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomRequest {
  name: string;
  description: string;
  isPrivate?: boolean;
  maxMembers?: number;
}

export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  isPrivate?: boolean;
  maxMembers?: number;
}
