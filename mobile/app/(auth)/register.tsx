import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    setIsLoading(true);
    // Simulate register
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(drawer)');
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0f172a]">
      <View className="px-6 pt-4 pb-2">
        <TouchableOpacity 
          onPress={() => router.push('/')}
          className="flex-row items-center w-24 h-10 z-10"
        >
          <ChevronLeft size={24} color="#fafafa" />
          <Text className="text-foreground ml-1 font-semibold">Trở về</Text>
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}>
          <View className="mb-8 mt-2 items-center">
            <Image 
              source={require('../../assets/images/logo.png')} 
              className="w-16 h-16 mb-4" 
              resizeMode="contain" 
            />
            <Text className="text-3xl font-black text-white mb-2 text-center">Đăng ký tài khoản</Text>
            <Text className="text-zinc-400 text-base text-center">
              Tham gia cộng đồng và bắt đầu hành trình bóng đá
            </Text>
          </View>

          {/* Google Login Button (Top) */}
          <TouchableOpacity 
            className="bg-white py-4 rounded-2xl items-center flex-row justify-center mb-6"
          >
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/120px-Google_%22G%22_logo.svg.png' }}
              className="w-5 h-5 mr-3"
              resizeMode="contain"
            />
            <Text className="text-[#1e293b] font-bold text-lg">Tiếp tục với Google</Text>
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-white/10" />
            <Text className="text-zinc-500 px-4 text-sm font-medium">hoặc</Text>
            <View className="flex-1 h-[1px] bg-white/10" />
          </View>

          <View className="space-y-5 mb-8">
            {/* Email Field */}
            <View>
              <Text className="text-zinc-300 font-medium mb-2 text-sm">Email</Text>
              <View className="bg-[#1e293b] border border-white/5 rounded-xl px-4 py-4 flex-row items-center">
                <TextInput
                  className="flex-1 text-white text-base"
                  placeholder="fan@example.com"
                  placeholderTextColor="#64748b"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Field */}
            <View>
              <Text className="text-zinc-300 font-medium mb-2 text-sm">Mật khẩu</Text>
              <View className="bg-[#1e293b] border border-white/5 rounded-xl px-4 py-4 flex-row items-center">
                <TextInput
                  className="flex-1 text-white text-base"
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="ml-2">
                  {showPassword ? (
                    <EyeOff size={20} color="#cbd5e1" />
                  ) : (
                    <Eye size={20} color="#cbd5e1" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View>
              <Text className="text-zinc-300 font-medium mb-2 text-sm">Xác nhận mật khẩu</Text>
              <View className="bg-[#1e293b] border border-white/5 rounded-xl px-4 py-4 flex-row items-center">
                <TextInput
                  className="flex-1 text-white text-base"
                  placeholder="••••••••"
                  placeholderTextColor="#64748b"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="ml-2">
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#cbd5e1" />
                  ) : (
                    <Eye size={20} color="#cbd5e1" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            className="bg-emerald-500 py-4 rounded-xl items-center shadow-lg shadow-emerald-500/30 flex-row justify-center mb-6"
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#03060a" />
            ) : (
              <Text className="text-white font-bold text-lg">Đăng ký</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-zinc-400">Đã có tài khoản? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-emerald-400 font-bold">Đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
