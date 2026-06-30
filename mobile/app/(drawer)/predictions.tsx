import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Star } from 'lucide-react-native';

export default function PredictionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#03060a]">
      <View className="flex-row items-center px-4 py-3 border-b border-white/10">
        <DrawerToggleButton tintColor="#fafafa" />
        <Text className="text-xl font-bold text-white ml-2">Dự đoán tỷ số</Text>
      </View>
      
      <ScrollView className="flex-1 p-6">
        <View className="bg-emerald-500/10 p-6 rounded-3xl border border-emerald-500/30 items-center mb-8">
          <Star size={48} color="#10b981" />
          <Text className="text-2xl font-black text-white mt-4">Điểm của bạn</Text>
          <Text className="text-5xl font-black text-emerald-400 mt-2">1,250</Text>
        </View>

        <Text className="text-xl font-bold text-white mb-4">Trận đấu nổi bật</Text>
        <View className="bg-[#080d14] p-6 rounded-2xl border border-white/10 mb-4">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white font-bold text-lg">Man United</Text>
            <Text className="text-zinc-500 font-bold">VS</Text>
            <Text className="text-white font-bold text-lg">Arsenal</Text>
          </View>
          <TouchableOpacity className="bg-emerald-500 py-4 rounded-xl items-center shadow-lg shadow-emerald-500/30">
            <Text className="text-[#03060a] font-black text-lg">Đặt cược ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
