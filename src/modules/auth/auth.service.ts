import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserResponseDto } from './dto/user-response-dto';
import { PrismaClient, TypeAuth, User} from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private prisma: PrismaClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.prisma = new PrismaClient();
  }
  
  async register(registerDTO: RegisterDto): Promise<UserResponseDto> {
    const userFound = await this.findUserByEmail(registerDTO.email);
    if(userFound) throw new BadRequestException('Email already exists');
    const newUser = await this.prisma.user.create({
      data: {
        typeAuth: TypeAuth.account,
        email: registerDTO.email,
        name: registerDTO.name,
        password: await bcrypt.hash(registerDTO.password, 10),
      },
    });

    const {password, ...rest} = newUser;

    return rest as UserResponseDto;
  }

  async login(loginDTO: LoginDto): Promise<UserResponseDto> {
    const user = await this.findUserByEmail(loginDTO.email);
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await bcrypt.compare(loginDTO.password, user.password);
    if (!isPasswordValid) throw new BadRequestException('Invalid password');

    
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    

    const {password, ...rest} = user;

    return {
      ...rest,
      accessToken,
      refreshToken
    };
  }

  async refreshToken(refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('Refresh token is required');

    let payload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }

    const user = await this.findUserById(payload.sub);

    if (!user) throw new NotFoundException('User not found');

    const accessToken = await this.generateAccessToken(user);
    const newRefreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }

  async findUserById(id: string): Promise<UserResponseDto | null> {
    const userFound = await this.prisma.user.findUnique({
      where: { id }
    });
    if (!userFound) return null;

    return userFound as UserResponseDto;
  }

  private async findUserByEmail(email: string): Promise<UserResponseDto | null> {
    const userFound = await this.prisma.user.findUnique({
      where: { email }
    })
    if(!userFound) return null; 

    return userFound as UserResponseDto;
  }

  private async generateAccessToken(user: UserResponseDto): Promise<string> {
    const payload = {
      email: user.email,
      sub: user.id,
    }
    return this.jwtService.sign(payload,{
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES')
    })
  }

  private async generateRefreshToken(user: UserResponseDto): Promise<string> {
    const payload = {
      sub: user.id,
    }
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES')
    });
  }
}
