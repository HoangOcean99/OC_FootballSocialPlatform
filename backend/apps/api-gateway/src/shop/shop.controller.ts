import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('items')
  async getItems() {
    return this.shopService.getItems();
  }

  @UseGuards(JwtAuthGuard)
  @Post('buy/:id')
  async buyItem(@Request() req: any, @Param('id') itemId: string) {
    return this.shopService.buyItem(req.user.sub, itemId);
  }
}
