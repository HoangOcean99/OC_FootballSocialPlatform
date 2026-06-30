import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Shield, Users, Activity, AlertTriangle } from 'lucide-react-native';

export default function AdminScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#03060a]">
      <View className="flex-row items-center px-4 py-3 border-b border-white/10">
        <DrawerToggleButton tintColor="#fafafa" />
        <Text className="text-xl font-bold text-white ml-2">Quản trị hệ thống</Text>
      </View>
      
      <ScrollView className="flex-1 p-6">
        <View className="flex-row flex-wrap justify-between mb-8 mt-2">
          <View className="w-[48%] bg-[#080d14] p-4 rounded-2xl border border-white/10 mb-4">
            <Users size={24} color="#3b82f6" className="mb-2" />
            <Text className="text-zinc-400 text-sm">Người dùng</Text>
            <Text className="text-2xl font-bold text-white">12.4K</Text>
          </View>
          
          <View className="w-[48%] bg-[#080d14] p-4 rounded-2xl border border-white/10 mb-4">
            <Activity size={24} color="#10b981" className="mb-2" />
            <Text className="text-zinc-400 text-sm">Truy cập hằng ngày</Text>
            <Text className="text-2xl font-bold text-white">5.2K</Text>
          </View>
          
          <View className="w-[48%] bg-[#080d14] p-4 rounded-2xl border border-white/10 mb-4">
            <AlertTriangle size={24} color="#f59e0b" className="mb-2" />
            <Text className="text-zinc-400 text-sm">Báo cáo vi phạm</Text>
            <Text className="text-2xl font-bold text-white">14</Text>
          </View>
          
          <View className="w-[48%] bg-[#080d14] p-4 rounded-2xl border border-white/10 mb-4">
            <Shield size={24} color="#8b5cf6" className="mb-2" />
            <Text className="text-zinc-400 text-sm">Bài đăng cần duyệt</Text>
            <Text className="text-2xl font-bold text-white">89</Text>
          </View>
        </View>

        <TouchableOpacity className="bg-red-500/10 border border-red-500/30 py-4 rounded-xl items-center mb-4">
          <Text className="text-red-500 font-bold">Xóa Cache Hệ Thống</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-white/5 border border-white/10 py-4 rounded-xl items-center">
          <Text className="text-white font-bold">Cài đặt nâng cao</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
