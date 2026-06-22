import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/user.schema';

export const SHOP_ITEMS = [
  { id: 'extra_prediction', name: 'Lượt Dự Đoán Thêm', type: 'CONSUMABLE', price: 500, description: 'Thêm 1 lượt dự đoán, có thể cộng dồn không giới hạn.', emoji: '🎟️' },
  { id: 'frame_dragon', name: 'Khung Avatar Rồng Lửa', type: 'COSMETIC_FRAME', price: 2000, description: 'Trang trí Avatar cực ngầu.', emoji: '🐉' },
  { id: 'name_vip_red', name: 'Tên Đặc Quyền VIP Đỏ', type: 'COSMETIC_NAME', price: 5000, description: 'Đổi màu tên nổi bật.', emoji: '👑' },
  { id: 'badge_wizard', name: 'Huy Hiệu Phù Thuỷ Dự Đoán', type: 'COSMETIC_BADGE', price: 10000, description: 'Biểu tượng đẳng cấp bên cạnh tên.', emoji: '🌟' }
];

@Injectable()
export class ShopService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getItems() {
    return SHOP_ITEMS;
  }

  async buyItem(userId: string, itemId: string) {
    const item = SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Vật phẩm không tồn tại');

    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const currentXp = user.xp || 0;
    if (currentXp < item.price) {
      throw new BadRequestException('Số dư XP không đủ');
    }

    if (item.type !== 'CONSUMABLE') {
      const purchased = user.purchasedItems || [];
      if (purchased.includes(itemId)) {
        throw new BadRequestException('Bạn đã sở hữu vật phẩm này');
      }
      user.purchasedItems = [...purchased, itemId];
    } else {
      if (itemId === 'extra_prediction') {
        user.extraPredictions = (user.extraPredictions || 0) + 1;
      }
    }

    user.xp = currentXp - item.price;
    await user.save();
    return { success: true, xp: user.xp, extraPredictions: user.extraPredictions, purchasedItems: user.purchasedItems };
  }
}
