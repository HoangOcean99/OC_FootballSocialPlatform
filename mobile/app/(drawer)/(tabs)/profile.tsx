import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Settings, LogOut, Heart, MessageCircle, Star } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        {/* Profile Header */}
        <View className="bg-card p-6 border-b border-border items-center">
          <View className="flex-row w-full justify-end mb-2">
            <TouchableOpacity className="ml-4">
              <Settings size={24} color="#71717a" />
            </TouchableOpacity>
          </View>
          
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?u=current_user' }} 
            className="w-24 h-24 rounded-full bg-border border-2 border-primary mb-4" 
          />
          <Text className="text-2xl font-bold text-foreground">John Doe</Text>
          <Text className="text-zinc-500">@johndoe_football</Text>
          
          <View className="flex-row mt-6 space-x-8">
            <View className="items-center">
              <Text className="text-xl font-bold text-foreground">142</Text>
              <Text className="text-zinc-500 text-sm">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-foreground">12.5k</Text>
              <Text className="text-zinc-500 text-sm">Followers</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold text-foreground">500</Text>
              <Text className="text-zinc-500 text-sm">Following</Text>
            </View>
          </View>
        </View>

        {/* Stats & Activity */}
        <View className="p-4">
          <Text className="text-lg font-bold text-foreground mb-3">Your Stats</Text>
          <View className="flex-row justify-between mb-6">
            <View className="bg-card flex-1 mr-2 p-4 rounded-xl border border-border items-center">
              <Star size={24} color="#10b981" className="mb-2" />
              <Text className="text-xl font-bold text-foreground">1,240</Text>
              <Text className="text-zinc-500 text-xs">Points</Text>
            </View>
            <View className="bg-card flex-1 ml-2 p-4 rounded-xl border border-border items-center">
              <Heart size={24} color="#ef4444" className="mb-2" />
              <Text className="text-xl font-bold text-foreground">8.2k</Text>
              <Text className="text-zinc-500 text-xs">Likes Rcvd</Text>
            </View>
          </View>

          <TouchableOpacity className="bg-card flex-row items-center justify-center py-4 rounded-xl border border-border mt-4">
            <LogOut size={20} color="#ef4444" />
            <Text className="text-danger font-bold ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
