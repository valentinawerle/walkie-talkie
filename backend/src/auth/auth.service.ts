import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (user && (await this.usersService.validatePassword(user, password))) {
      const userObject = user.toObject();
      const { password: _, ...result } = userObject;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update online status
    await this.usersService.updateOnlineStatus(user._id, true);

    const payload = { email: user.email, sub: user._id, username: user.username };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isOnline: true,
      },
    };
  }

  async logout(userId: string) {
    await this.usersService.updateOnlineStatus(userId, false);
    return { message: 'Logged out successfully' };
  }
} 