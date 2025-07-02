import { Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './user.interface';

@Injectable()
export class AuthService {
  private users: User[] = [];

  register(dto: RegisterDto) {
    const userExists = this.users.find(u => u.username === dto.username);
    if (userExists) {
      throw new Error('User already exists');
    }
    this.users.push({ ...dto });
    return { message: 'User registered successfully' };
  }

  login(dto: LoginDto) {
    const user = this.users.find(
      u => u.username === dto.username && u.password === dto.password,
    );
    if (!user) {
      throw new Error('Invalid credentials');
    }

    return {
      message: 'Login successful',
      user: {
        username: user.username,
      },
      token: 'mocked-jwt-token', // Replace with real JWT later
    };
  }
}
