export interface User {
  _id: string;
  username: string;
  email: string;
  isOnline: boolean;
  lastSeen: string;
  rooms: string[];
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    isOnline: boolean;
  };
}
