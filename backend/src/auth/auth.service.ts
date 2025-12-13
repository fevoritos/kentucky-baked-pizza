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

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, address, phone } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Get customer role (id = 2)
    const customerRole = await this.roleRepository.findByName('customer');
    if (!customerRole) {
      throw new Error('Customer role not found');
    }

    // Create user
    const user = await this.userRepository.create({
      email,
      passwordHash,
      name,
      address: address || '',
      phone: phone || '',
      role: customerRole.id, // Default role id
    });

    // Get user with role details for response
    const userWithRole = await this.userRepository.findByIdWithRole(user.id);
    const roleName = userWithRole?.roleDetails.name || 'customer';

    // Generate JWT token (store role name in JWT for convenience)
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

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get user with role details for response
    const userWithRole = await this.userRepository.findByIdWithRole(user.id);
    const roleName = userWithRole?.roleDetails.name || 'customer';

    // Generate JWT token (store role name in JWT for convenience)
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

  /**
   * Validate user by ID (for JWT strategy)
   */
  async validateUser(userId: number): Promise<User | null> {
    return await this.userRepository.findById(userId);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { passwordHash, ...userProfile } = user;
    return userProfile;
  }
}
