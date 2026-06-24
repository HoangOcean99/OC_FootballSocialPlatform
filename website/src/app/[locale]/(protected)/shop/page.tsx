'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Coins, CheckCircle2 } from 'lucide-react';
import { fetchShopItems, buyShopItem } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface ShopItem {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  emoji: string;
}

export default function ShopPage() {
  const t = useTranslations('Shop');
  const { user, updateUser } = useAuthStore();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);

  useEffect(() => {
    fetchShopItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleBuy = async (item: ShopItem) => {
    if (!user) return;
    if (user.xp < item.price) {
      toast.error('Bạn không đủ XP để mua vật phẩm này!');
      return;
    }

    setBuyingId(item.id);
    try {
      const res = await buyShopItem(item.id);
      if (res.success) {
        updateUser({
          xp: res.xp,
          extraPredictions: res.extraPredictions,
          purchasedItems: res.purchasedItems
        });
        toast.success('Mua thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi mua vật phẩm.');
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-amber-500" />
            {t('title')}
          </h1>
          <p className="text-gray-400 text-sm">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {loading ? (
          <div className="col-span-full text-center py-10 text-gray-500 font-bold">...</div>
        ) : items.map((item, i) => {
          const isOwned = item.type !== 'CONSUMABLE' && user?.purchasedItems?.includes(item.id);
          
          const itemTransMap: Record<string, {name: string, desc: string}> = {
            'extra_prediction': { name: 'extra_predict', desc: 'extra_predict_desc' },
            'frame_dragon': { name: 'avatar_dragon', desc: 'avatar_dragon_desc' },
            'name_vip_red': { name: 'vip_red', desc: 'vip_red_desc' },
            'badge_wizard': { name: 'badge_wizard', desc: 'badge_wizard_desc' }
          };
          const tName = itemTransMap[item.id] ? t(itemTransMap[item.id].name as any) : item.name;
          const tDesc = itemTransMap[item.id] ? t(itemTransMap[item.id].desc as any) : item.description;
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={item.id}
              className="bg-gradient-to-br from-[#1c140c] to-[#080d14] border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none" />
              
              <div className="text-6xl text-center mb-4">{item.emoji}</div>
              <h3 className="text-lg font-black text-white text-center mb-2">{tName}</h3>
              <p className="text-sm text-gray-400 text-center flex-1 mb-6">{tDesc}</p>
              
              <button
                onClick={() => handleBuy(item)}
                disabled={isOwned || buyingId === item.id}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  isOwned 
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5' 
                    : buyingId === item.id
                      ? 'bg-amber-500/50 text-amber-950 cursor-wait'
                      : 'bg-amber-500 text-amber-950 hover:bg-amber-400 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105'
                }`}
              >
                {isOwned ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {t('btn_owned')}
                  </>
                ) : (
                  <>
                    <Coins className="w-5 h-5" />
                    {t('btn_buy')} ({item.price.toLocaleString()} XP)
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
