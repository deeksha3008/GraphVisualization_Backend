// import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { JwtAuthGuard } from './jwt-auth.guard';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('login')
//   async login(@Body() loginDto: { username: string, password: string }) {
//     return this.authService.login(loginDto);
//   }

//   @Post('register')
//   async register(@Body() registerDto: { username: string, password: string }) {
//     return this.authService.register(registerDto);
//   }
// }


import { Controller, Post, UseGuards, Request, Body, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const user = await this.authService.validateUser(req.body.username, req.body.password);
    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() user) {
    return this.authService.register(user);
  }
}




