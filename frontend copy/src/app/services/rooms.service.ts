import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Room, CreateRoomRequest, UpdateRoomRequest } from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAllRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/rooms`);
  }

  getMyRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/rooms/my-rooms`);
  }

  getRoomById(id: string): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/rooms/${id}`);
  }

  createRoom(roomData: CreateRoomRequest): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/rooms`, roomData);
  }

  updateRoom(id: string, roomData: UpdateRoomRequest): Observable<Room> {
    return this.http.patch<Room>(`${this.apiUrl}/rooms/${id}`, roomData);
  }

  joinRoom(id: string): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/rooms/${id}/join`, {});
  }

  leaveRoom(id: string): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/rooms/${id}/leave`, {});
  }

  addAdmin(roomId: string, userId: string): Observable<Room> {
    return this.http.post<Room>(`${this.apiUrl}/rooms/${roomId}/admins/${userId}`, {});
  }

  deleteRoom(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/rooms/${id}`);
  }
}
