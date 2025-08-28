import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WorkOS } from '@workos-inc/node';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // WorkOS user ID
  email: string;
  firstName?: string;
  lastName?: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: number;
  workosUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private workos: WorkOS;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {
    this.workos = new WorkOS(process.env.WORKOS_API_KEY, {
      clientId: process.env.WORKOS_CLIENT_ID,
    });
  }

  /**
   * Get WorkOS authorization URL for login
   */
  getAuthorizationUrl(redirectUri: string): string {
    return this.workos.userManagement.getAuthorizationUrl({
      provider: 'authkit',
      redirectUri,
      clientId: process.env.WORKOS_CLIENT_ID || '',
    });
  }

  /**
   * Handle WorkOS callback and create/update user
   */
  async handleCallback(code: string, state?: string): Promise<{ accessToken: string; user: AuthUser }> {
    try {
      // Exchange code for user info
      const { user: workosUser } = await this.workos.userManagement.authenticateWithCode({
        code,
        clientId: process.env.WORKOS_CLIENT_ID || '',
      });

      this.logger.log(`User authenticated via WorkOS: ${workosUser.email}`);

      // Find or create user in database
      let user = await this.prisma.user.findUnique({
        where: { workosUserId: workosUser.id }
      });

      if (!user) {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            workosUserId: workosUser.id,
            email: workosUser.email,
            firstName: workosUser.firstName || null,
            lastName: workosUser.lastName || null,
          }
        });
        this.logger.log(`Created new user: ${user.email}`);
      } else {
        // Update existing user info
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            email: workosUser.email,
            firstName: workosUser.firstName || null,
            lastName: workosUser.lastName || null,
          }
        });
        this.logger.log(`Updated existing user: ${user.email}`);
      }

      // Create JWT token
      const payload: JwtPayload = {
        sub: workosUser.id,
        email: workosUser.email,
        firstName: workosUser.firstName || undefined,
        lastName: workosUser.lastName || undefined,
      };

      const jwt = this.jwtService.sign(payload);

      return {
        accessToken: jwt,
        user: {
          id: user.id,
          workosUserId: user.workosUserId,
          email: user.email,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        }
      };
    } catch (error) {
      this.logger.error('Failed to handle WorkOS callback', error.stack);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  /**
   * Validate JWT token and return user
   */
  async validateToken(payload: JwtPayload): Promise<AuthUser> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { workosUserId: payload.sub }
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        workosUserId: user.workosUserId,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      };
    } catch (error) {
      this.logger.error('Failed to validate token', error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Logout user (invalidate session)
   */
  async logout(workosUserId: string): Promise<void> {
    try {
      // Here you could add token blacklisting or other logout logic
      this.logger.log(`User logged out: ${workosUserId}`);
    } catch (error) {
      this.logger.error('Failed to logout user', error);
    }
  }
}