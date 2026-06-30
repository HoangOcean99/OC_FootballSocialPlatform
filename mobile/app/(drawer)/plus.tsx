import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Star, Check } from 'lucide-react-native';

export default function PlusScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#03060a]">
      <View className="flex-row items-center px-4 py-3 border-b border-white/10">
        <DrawerToggleButton tintColor="#fafafa" />
        <Text className="text-xl font-bold text-white ml-2">PitchGrid Plus</Text>
      </View>
      
      <ScrollView className="flex-1 p-6">
        <View className="bg-gradient-to-b from-emerald-900/40 to-[#080d14] p-8 rounded-3xl border border-emerald-500/30 shadow-2xl mt-4">
          <View className="bg-emerald-500 self-start px-3 py-1 rounded-full mb-4">
            <Text className="text-[#03060a] font-black text-xs uppercase tracking-wider">PRO PLAN</Text>
          </View>
          <Text className="text-2xl font-bold text-emerald-400 mb-2">Premium <Star size={20} color="#34d399" fill="#34d399" /></Text>
          <Text className="text-4xl font-black text-white mb-6">$4.99<Text className="text-lg text-zinc-500">/tháng</Text></Text>
          
          <View className="space-y-4 mb-8">
            <View className="flex-row items-center"><Check size={20} color="#34d399" className="mr-3" /><Text className="text-zinc-300">Không quảng cáo</Text></View>
            <View className="flex-row items-center"><Check size={20} color="#34d399" className="mr-3" /><Text className="text-zinc-300">Huy hiệu VIP độc quyền</Text></View>
            <View className="flex-row items-center"><Check size={20} color="#34d399" className="mr-3" /><Text className="text-zinc-300">Nhân đôi điểm dự đoán</Text></View>
            <View className="flex-row items-center"><Check size={20} color="#34d399" className="mr-3" /><Text className="text-zinc-300">Hỗ trợ ưu tiên</Text></View>
          </View>

          <TouchableOpacity className="w-full bg-emerald-500 py-4 rounded-xl items-center shadow-lg shadow-emerald-500/30">
            <Text className="text-[#03060a] font-black text-lg">Nâng cấp ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
