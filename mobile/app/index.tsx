import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, SafeAreaView, StatusBar, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter } from 'react-native-router-flux';
import { router } from 'expo-router';
import { Trophy, ChevronRight, Activity, Users, Star, BookOpen, MessageSquare, Check } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ROW1_IMAGES = [
  "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Final_SuperCopa_ESP_2011_%286056383408%29.jpg/960px-Final_SuperCopa_ESP_2011_%286056383408%29.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Argentina_3-3_Francia_-_Copa_Mundial_2022_-_Montiel_patea_el_penal_de_la_victoria.jpg/960px-Argentina_3-3_Francia_-_Copa_Mundial_2022_-_Montiel_patea_el_penal_de_la_victoria.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Argentina_vs_France_2018_World_Cup_28.jpg/960px-Argentina_vs_France_2018_World_Cup_28.jpg",
];

const FEATURES = [
  { icon: <Activity color="#10b981" />, title: 'Live Match Updates', desc: 'Real-time scores, stats, and play-by-play commentary for every major league.' },
  { icon: <Users color="#10b981" />, title: 'Fan Communities', desc: 'Join dedicated groups for your favorite clubs and national teams.' },
  { icon: <Trophy color="#10b981" />, title: 'Predict & Win', desc: 'Compete with friends by predicting match outcomes and climb the leaderboard.' },
  { icon: <BookOpen color="#10b981" />, title: 'Tactical Analysis', desc: 'Deep dive into post-match breakdowns and player heatmaps.' },
];

export default function LandingPage() {
  return (
    <View className="flex-1 bg-[#03060a]">
      <StatusBar barStyle="light-content" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* 1. HERO SECTION */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1518605368461-1e1e11894d07?q=80&w=1000&auto=format&fit=crop' }}
          className="min-h-[90vh] justify-center"
          resizeMode="cover"
        >
          <View className="absolute inset-0 bg-[#03060a]/80" />
          <SafeAreaView className="px-6 py-12 flex-1 justify-center items-center">
            <View className="bg-white/10 px-4 py-2 rounded-full border border-white/20 mb-8 flex-row items-center">
              <View className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
              <Text className="text-emerald-400 font-bold text-xs">PITCHGRID MOBILE APP IS HERE</Text>
            </View>
            
            <Image 
              source={require('../assets/images/logo.png')} 
              className="w-32 h-32 mb-6" 
              resizeMode="contain" 
            />
            
            <Text className="text-5xl font-black text-white text-center tracking-tighter mb-4 leading-tight">
              Where the <Text className="text-emerald-400">Beautiful Game</Text> Lives.
            </Text>
            
            <Text className="text-zinc-400 text-lg text-center leading-relaxed mb-10 px-4">
              The ultimate social platform for football fans. Connect, predict, and celebrate every goal together.
            </Text>

            <TouchableOpacity 
              className="w-full bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-emerald-500/30 mb-4"
              onPress={() => router.push('/(auth)/register')}
            >
              <Text className="text-[#03060a] font-black text-lg mr-2">Vào PitchGrid</Text>
              <ChevronRight size={20} color="#03060a" />
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-full bg-white/5 py-4 rounded-2xl items-center border border-white/10"
              onPress={() => router.push('/(auth)/login')}
            >
              <Text className="text-white font-bold text-lg">Đăng nhập</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </ImageBackground>

        {/* 2. GALLERY SECTION */}
        <View className="py-16 bg-[#03060a]">
          <View className="px-6 mb-8 text-center items-center">
            <Text className="text-3xl font-black text-white text-center">Bắt trọn <Text className="text-emerald-400 italic">khoảnh khắc</Text></Text>
            <Text className="text-zinc-500 text-center mt-2">Sống cùng nhịp đập của hàng triệu fan hâm mộ trên toàn thế giới.</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6 pb-8">
            {ROW1_IMAGES.map((img, i) => (
              <Image 
                key={i} 
                source={{ uri: img }} 
                className="w-64 h-40 rounded-2xl mr-4 border border-white/10"
              />
            ))}
          </ScrollView>
        </View>

        {/* 3. FEATURES SECTION */}
        <View className="py-16 px-6 bg-[#080d14] border-y border-white/5">
          <Text className="text-3xl font-black text-white text-center mb-10">Tính năng <Text className="text-emerald-400 italic">nổi bật</Text></Text>
          {FEATURES.map((feat, i) => (
            <View key={i} className="bg-white/5 p-6 rounded-3xl mb-4 border border-white/10">
              <View className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
                {feat.icon}
              </View>
              <Text className="text-xl font-bold text-white mb-2">{feat.title}</Text>
              <Text className="text-zinc-400 leading-relaxed">{feat.desc}</Text>
            </View>
          ))}
        </View>

        {/* 4. PREMIUM SECTION */}
        <View className="py-16 px-6 bg-[#03060a]">
          <Text className="text-3xl font-black text-white text-center mb-4">PitchGrid <Text className="text-emerald-400 italic">Premium</Text></Text>
          <Text className="text-zinc-500 text-center mb-10">Nâng cấp trải nghiệm bóng đá của bạn lên một tầm cao mới.</Text>

          <View className="bg-gradient-to-b from-emerald-900/40 to-[#080d14] p-8 rounded-3xl border border-emerald-500/30 shadow-2xl">
            <View className="bg-emerald-500 self-start px-3 py-1 rounded-full mb-4">
              <Text className="text-[#03060a] font-black text-xs uppercase tracking-wider">PRO PLAN</Text>
            </View>
            <Text className="text-2xl font-bold text-emerald-400 mb-2">Premium</Text>
            <Text className="text-4xl font-black text-white mb-6">$4.99<Text className="text-lg text-zinc-500">/tháng</Text></Text>
            
            <View className="space-y-4 mb-8">
              <View className="flex-row items-center"><Check size={20} color="#34d399" className="mr-3" /><Text className="text-zinc-300">Không quảng cáo</Text></View>
              <View className="flex-row items-center"><Check size={20} color="#34d399" className="mr-3" /><Text className="text-zinc-300">Huy hiệu VIP độc quyền</Text></View>
              <View className="flex-row items-center"><Check size={20} color="#34d399" className="mr-3" /><Text className="text-zinc-300">Nhân đôi điểm dự đoán</Text></View>
            </View>

            <TouchableOpacity className="w-full bg-emerald-500 py-4 rounded-xl items-center shadow-lg shadow-emerald-500/30">
              <Text className="text-[#03060a] font-black text-lg">Nâng cấp ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. CTA SECTION */}
        <View className="py-24 px-6 items-center bg-[#080d14]">
          <View className="w-20 h-20 bg-emerald-500 rounded-3xl items-center justify-center mb-6 shadow-xl shadow-emerald-500/40">
            <Trophy size={40} color="#03060a" />
          </View>
          <Text className="text-4xl font-black text-white text-center mb-8">Bạn đã sẵn sàng?</Text>
          <TouchableOpacity 
            className="w-full max-w-sm bg-emerald-400 py-5 rounded-2xl items-center shadow-lg shadow-emerald-500/30"
            onPress={() => router.push('/(auth)/register')}
          >
            <Text className="text-[#03060a] font-black text-xl">Tham gia ngay</Text>
          </TouchableOpacity>
        </View>

        <SafeAreaView className="pb-10 pt-4 items-center border-t border-white/5">
          <Text className="text-zinc-600 text-sm">© 2026 PitchGrid. All rights reserved.</Text>
        </SafeAreaView>

      </ScrollView>
    </View>
  );
}
