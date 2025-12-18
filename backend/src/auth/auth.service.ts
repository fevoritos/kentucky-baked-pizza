import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { RoleRepository } from '../repositories/role.repository';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { User } from '../types/database.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, address, phone } = registerDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const customerRole = await this.roleRepository.findByName('customer');
    if (!customerRole) {
      throw new Error('Customer role not found');
    }

    const user = await this.userRepository.create({
      email,
      passwordHash,
      name,
      address: address || '',
      phone: phone || '',
      role: customerRole.id,
    });

    const userWithRole = await this.userRepository.findByIdWithRole(user.id);
    const roleName = userWithRole?.roleDetails.name || 'customer';

    const payload = { sub: user.id, email: user.email, role: roleName };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleName,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userWithRole = await this.userRepository.findByIdWithRole(user.id);
    const roleName = userWithRole?.roleDetails.name || 'customer';

    const payload = { sub: user.id, email: user.email, role: roleName };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: roleName,
      },
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }

  async getProfile(userId: number): Promise<any> {
    const userWithRole = await this.userRepository.findByIdWithRole(userId);
    if (!userWithRole) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...userProfile } = userWithRole;
    return {
      ...userProfile,
      role: userWithRole.roleDetails.name,
    };
  }
}
