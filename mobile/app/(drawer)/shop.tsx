import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { ShoppingBag } from 'lucide-react-native';

export default function ShopScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#03060a]">
      <View className="flex-row items-center px-4 py-3 border-b border-white/10">
        <DrawerToggleButton tintColor="#fafafa" />
        <Text className="text-xl font-bold text-white ml-2">Cửa hàng</Text>
      </View>
      
      <ScrollView className="flex-1 p-6">
        <View className="items-center mb-8 mt-4">
          <View className="w-20 h-20 bg-emerald-500/20 rounded-full items-center justify-center mb-4 border border-emerald-500/30">
            <ShoppingBag size={40} color="#10b981" />
          </View>
          <Text className="text-3xl font-black text-white text-center">PitchGrid Shop</Text>
          <Text className="text-zinc-400 text-center mt-2">Dùng điểm dự đoán để đổi quà tặng độc quyền.</Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {[1, 2, 3, 4].map((item) => (
            <View key={item} className="w-[48%] bg-[#080d14] rounded-2xl border border-white/10 p-4 mb-4 items-center">
              <View className="w-20 h-20 bg-white/5 rounded-xl mb-4" />
              <Text className="text-white font-bold mb-2">Vật phẩm {item}</Text>
              <Text className="text-emerald-400 font-bold mb-4">500 pts</Text>
              <TouchableOpacity className="w-full bg-white/10 py-2 rounded-lg items-center">
                <Text className="text-white font-semibold">Đổi ngay</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
