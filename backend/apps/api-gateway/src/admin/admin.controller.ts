import { Controller, Get, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getUsers() {
    return this.adminService.getUsers();
  }

  @Put('users/:id/tier')
  updateUserTier(@Param('id') id: string, @Body('tier') tier: 'REGULAR' | 'PLUS') {
    return this.adminService.updateUserTier(id, tier);
  }

  @Put('users/:id/role')
  updateUserRole(@Param('id') id: string, @Body('role') role: 'USER' | 'ADMIN') {
    return this.adminService.updateUserRole(id, role);
  }

  @Put('users/:id/ban')
  banUser(@Param('id') id: string, @Body('isBanned') isBanned: boolean) {
    return this.adminService.banUser(id, isBanned);
  }
}
