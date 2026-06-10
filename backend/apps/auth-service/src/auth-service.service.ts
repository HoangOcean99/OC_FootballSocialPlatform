import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as admin from 'firebase-admin';
import { User, UserDocument, AuthProvider } from './schemas/user.schema';
import { NATIONAL_TEAMS, POPULAR_CLUBS } from './constants/football-data.constants';

@Injectable()
export class AuthServiceService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {
    this.initFirebaseAdmin();
  }

  private initFirebaseAdmin() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  private generateToken(user: UserDocument) {
    const payload = {
      sub: user._id,
      username: user.username,
      email: user.email,
      level: user.level,
      onboardingCompleted: user.onboardingCompleted,
    };
    return this.jwtService.sign(payload);
  }

  private formatUser(user: UserDocument) {
    return {
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      level: user.level,
      xp: user.xp,
      favoriteClubs: user.favoriteClubs,
      favoriteNationalTeams: user.favoriteNationalTeams,
      onboardingCompleted: user.onboardingCompleted,
    };
  }

  // ─── Traditional Register ─────────────────────────────────────────────────
  async register(data: { username: string; email: string; password: string }) {
    const { username, email, password } = data;

    const existing = await this.userModel.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (existing) {
      if (existing.email === email.toLowerCase()) return { error: 'Email đã được sử dụng' };
      return { error: 'Username đã được sử dụng' };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userModel.create({
      username,
      email: email.toLowerCase(),
      passwordHash,
      provider: AuthProvider.LOCAL,
      onboardingCompleted: false,
    });

    return {
      access_token: this.generateToken(user),
      user: this.formatUser(user),
      requiresOnboarding: true,
    };
  }

  // ─── Traditional Login ────────────────────────────────────────────────────
  async login(data: { email: string; password: string }) {
    const { email, password } = data;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user || !user.passwordHash) {
      return { error: 'Email hoặc mật khẩu không đúng' };
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { error: 'Email hoặc mật khẩu không đúng' };
    }

    return {
      access_token: this.generateToken(user),
      user: this.formatUser(user),
      requiresOnboarding: !user.onboardingCompleted,
    };
  }

  // ─── Firebase (Google) Auth ────────────────────────────────────────────────
  async firebaseAuth(data: { idToken: string }) {
    try {
      const decoded = await admin.auth().verifyIdToken(data.idToken);
      const { uid, email, name, picture } = decoded;

      let user = await this.userModel.findOne({ googleId: uid });
      const isNewUser = !user;

      if (!user) {
        // Kiểm tra email đã tồn tại chưa (tài khoản local)
        user = await this.userModel.findOne({ email: email?.toLowerCase() });
        if (user) {
          // Link tài khoản local với Google
          user.googleId = uid;
          user.provider = AuthProvider.GOOGLE;
          if (!user.avatarUrl && picture) user.avatarUrl = picture;
          await user.save();
        } else {
          // Tạo user mới
          const baseUsername = (name || email?.split('@')[0] || 'fan')
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
          const uniqueUsername = `${baseUsername}_${Date.now().toString().slice(-4)}`;

          user = await this.userModel.create({
            username: uniqueUsername,
            email: email?.toLowerCase(),
            googleId: uid,
            avatarUrl: picture || '',
            provider: AuthProvider.GOOGLE,
            onboardingCompleted: false,
          });
        }
      }

      return {
        access_token: this.generateToken(user),
        user: this.formatUser(user),
        requiresOnboarding: isNewUser || !user.onboardingCompleted,
      };
    } catch (err) {
      return { error: 'Firebase token không hợp lệ' };
    }
  }

  // ─── Onboarding ────────────────────────────────────────────────────────────
  async completeOnboarding(data: {
    userId: string;
    username?: string;
    favoriteClubs: string[];
    favoriteNationalTeams: string[];
  }) {
    const { userId, username, favoriteClubs, favoriteNationalTeams } = data;

    const user = await this.userModel.findById(userId);
    if (!user) return { error: 'Người dùng không tồn tại' };

    if (username && username !== user.username) {
      const taken = await this.userModel.findOne({ username });
      if (taken) return { error: 'Username đã được sử dụng, vui lòng chọn username khác' };
      user.username = username;
    }

    user.favoriteClubs = favoriteClubs || [];
    user.favoriteNationalTeams = favoriteNationalTeams || [];
    user.onboardingCompleted = true;
    await user.save();

    return {
      access_token: this.generateToken(user),
      user: this.formatUser(user),
    };
  }

  // ─── Get Football Data for Onboarding ─────────────────────────────────────
  async getOnboardingData() {
    return { nationalTeams: NATIONAL_TEAMS, clubs: POPULAR_CLUBS };
  }
}
