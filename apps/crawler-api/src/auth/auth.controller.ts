import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Req,
  UseGuards,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import express from 'express';
import {AuthService, AuthUser} from './auth.service';
import {JwtAuthGuard} from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private authService: AuthService) {
  }

  /**
   * Initiate WorkOS authentication
   */
  @Get('login')
  login(@Res() res: express.Response, @Query('redirect') redirectUri?: string) {
    const callbackUri = `${process.env.API_BASE_URL}/auth/callback`;
    const authUrl = this.authService.getAuthorizationUrl(callbackUri);

    this.logger.log(`Redirecting to WorkOS login: ${authUrl}`);

    // Store the original redirect URI in a cookie if provided
    if (redirectUri) {
      res.cookie('auth_redirect', redirectUri, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000, // 10 minutes
      });
    }

    res.redirect(authUrl);
  }

  /**
   * Handle WorkOS callback
   */
  @Get('callback')
  async callback(
      @Query('code') code: string,
      @Query('state') state: string,
      @Req() req: express.Request,
      @Res() res: express.Response,
  ) {
    if (!code) {
      this.logger.error('No authorization code received from WorkOS');
      return res.status(400).json({error: 'No authorization code received'});
    }

    try {
      const {accessToken, user} = await this.authService.handleCallback(code, state);

      // Set secure HTTP-only cookie with JWT
      res.cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Get redirect URI from cookie or default to frontend
      const redirectUri = req.cookies?.['auth_redirect'] || process.env.FRONTEND_URL || 'http://localhost:8081';

      // Clear the redirect cookie
      res.clearCookie('auth_redirect');

      this.logger.log(`User ${user.email} authenticated successfully, redirecting to ${redirectUri}`);

      res.redirect(redirectUri);
    } catch (error) {
      this.logger.error('Authentication callback failed', error.stack);
      res.status(401).json({error: 'Authentication failed'});
    }
  }

  /**
   * Get current user info (protected route)
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Req() req: express.Request & { user: AuthUser }) {
    return {
      id: req.user.id,
      workosUserId: req.user.workosUserId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
    };
  }

  /**
   * Logout user
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: express.Request & { user: AuthUser }, @Res() res: express.Response) {
    try {
      await this.authService.logout(req.user.workosUserId);

      // Clear the JWT cookie
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      res.json({message: 'Logged out successfully'});
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw new HttpException('Logout failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Check authentication status
   */
  @Get('status')
  @UseGuards(JwtAuthGuard)
  getAuthStatus(@Req() req: express.Request & { user: AuthUser }) {
    return {
      authenticated: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
      }
    };
  }
}