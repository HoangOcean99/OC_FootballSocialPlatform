const fs = require('fs');
const path = require('path');

const newVi = {
  Navbar: {
    nav_home: "Trang chủ",
    nav_matches: "Trận đấu",
    nav_competitions: "Giải đấu",
    nav_communities: "Cộng đồng",
    nav_predictions: "Dự đoán",
    logout: "Đăng xuất",
    login: "Đăng nhập"
  },
  Sidebar: {
    fav_competitions: "Giải đấu yêu thích",
    view_all: "Xem tất cả →",
    joined_communities: "Cộng đồng đã tham gia",
    discover_more: "Khám phá thêm →",
    online_friends: "Bạn bè đang online",
    copyright: "PitchGrid © 2026<br/>Made with ❤️ for football fans"
  },
  Auth: {
    login_welcome: "Chào mừng trở lại!",
    login_desc: "Đăng nhập để tiếp tục hành trình bóng đá",
    google_continue: "Tiếp tục với Google",
    google_processing: "Đang xử lý...",
    or: "hoặc",
    email_label: "Email",
    email_placeholder: "fan@example.com",
    password_label: "Mật khẩu",
    password_placeholder: "••••••••",
    login_btn: "Đăng nhập",
    login_loading: "Đang đăng nhập...",
    no_account: "Chưa có tài khoản?",
    register_now: "Đăng ký ngay",
    tagline: "Tham gia cùng hàng triệu fan bóng đá trên toàn thế giới",
    register_title: "Tạo tài khoản",
    register_desc: "Miễn phí mãi mãi 🎉",
    google_register: "Đăng ký với Google",
    or_email_register: "hoặc đăng ký với email",
    username_label: "Tên người dùng",
    username_placeholder: "fan_bongda",
    username_hint: "Chỉ dùng chữ cái, số và dấu gạch dưới",
    password_confirm_label: "Xác nhận mật khẩu",
    register_btn: "Tạo tài khoản",
    register_loading: "Đang tạo tài khoản...",
    has_account: "Đã có tài khoản?",
    login_link: "Đăng nhập"
  },
  Home: {
    live_now: "Đang diễn ra",
    live_count: "{count} trận đang live",
    view_all: "Xem tất cả →",
    view_all_matches: "Xem tất cả trận đấu",
    share_thoughts: "Chia sẻ suy nghĩ về bóng đá...",
    post_btn: "Đăng",
    trending_posts: "Bài viết nổi bật",
    tab_all: "Tất cả",
    tab_following: "Theo dõi",
    tab_hot: "🔥 Hot",
    load_more_posts: "Xem thêm bài viết",
    upcoming_matches: "Trận đấu sắp diễn ra",
    top_communities: "Cộng đồng nổi bật",
    discover: "Khám phá →",
    predictions_board: "BXH dự đoán",
    view_board: "Xem BXH →",
    join_prediction: "🎯 Tham gia dự đoán ngay",
    today_stats: "Thống kê hôm nay",
    stat_live: "Trận đang live",
    stat_new_posts: "Bài đăng mới",
    stat_predictions: "Dự đoán hôm nay",
    stat_online: "Thành viên online"
  }
};

const newEn = {
  Navbar: {
    nav_home: "Home",
    nav_matches: "Matches",
    nav_competitions: "Competitions",
    nav_communities: "Communities",
    nav_predictions: "Predictions",
    logout: "Logout",
    login: "Login"
  },
  Sidebar: {
    fav_competitions: "Favorite Competitions",
    view_all: "View all →",
    joined_communities: "Joined Communities",
    discover_more: "Discover more →",
    online_friends: "Online Friends",
    copyright: "PitchGrid © 2026<br/>Made with ❤️ for football fans"
  },
  Auth: {
    login_welcome: "Welcome back!",
    login_desc: "Login to continue your football journey",
    google_continue: "Continue with Google",
    google_processing: "Processing...",
    or: "or",
    email_label: "Email",
    email_placeholder: "fan@example.com",
    password_label: "Password",
    password_placeholder: "••••••••",
    login_btn: "Login",
    login_loading: "Logging in...",
    no_account: "Don't have an account?",
    register_now: "Register now",
    tagline: "Join millions of football fans worldwide",
    register_title: "Create Account",
    register_desc: "Free forever 🎉",
    google_register: "Register with Google",
    or_email_register: "or register with email",
    username_label: "Username",
    username_placeholder: "football_fan",
    username_hint: "Letters, numbers, and underscores only",
    password_confirm_label: "Confirm Password",
    register_btn: "Create Account",
    register_loading: "Creating account...",
    has_account: "Already have an account?",
    login_link: "Login"
  },
  Home: {
    live_now: "Live Now",
    live_count: "{count} live matches",
    view_all: "View all →",
    view_all_matches: "View all matches",
    share_thoughts: "Share your football thoughts...",
    post_btn: "Post",
    trending_posts: "Trending Posts",
    tab_all: "All",
    tab_following: "Following",
    tab_hot: "🔥 Hot",
    load_more_posts: "Load more posts",
    upcoming_matches: "Upcoming Matches",
    top_communities: "Top Communities",
    discover: "Discover →",
    predictions_board: "Predictions Leaderboard",
    view_board: "View Board →",
    join_prediction: "🎯 Join Predictions Now",
    today_stats: "Today's Stats",
    stat_live: "Live Matches",
    stat_new_posts: "New Posts",
    stat_predictions: "Predictions Today",
    stat_online: "Online Members"
  }
};

const newJa = {
  Navbar: {
    nav_home: "ホーム",
    nav_matches: "試合",
    nav_competitions: "大会",
    nav_communities: "コミュニティ",
    nav_predictions: "予想",
    logout: "ログアウト",
    login: "ログイン"
  },
  Sidebar: {
    fav_competitions: "お気に入りの大会",
    view_all: "すべて見る →",
    joined_communities: "参加中のコミュニティ",
    discover_more: "もっと発見する →",
    online_friends: "オンラインの友達",
    copyright: "PitchGrid © 2026<br/>Made with ❤️ for football fans"
  },
  Auth: {
    login_welcome: "お帰りなさい！",
    login_desc: "ログインしてサッカーの旅を続けましょう",
    google_continue: "Googleで続ける",
    google_processing: "処理中...",
    or: "または",
    email_label: "メール",
    email_placeholder: "fan@example.com",
    password_label: "パスワード",
    password_placeholder: "••••••••",
    login_btn: "ログイン",
    login_loading: "ログイン中...",
    no_account: "アカウントをお持ちでないですか？",
    register_now: "今すぐ登録",
    tagline: "世界中の何百万ものサッカーファンに加わりましょう",
    register_title: "アカウントを作成",
    register_desc: "永久に無料 🎉",
    google_register: "Googleで登録",
    or_email_register: "またはメールで登録",
    username_label: "ユーザー名",
    username_placeholder: "football_fan",
    username_hint: "文字、数字、アンダースコアのみ",
    password_confirm_label: "パスワードを認証する",
    register_btn: "アカウントを作成",
    register_loading: "アカウントを作成中...",
    has_account: "すでにアカウントをお持ちですか？",
    login_link: "ログイン"
  },
  Home: {
    live_now: "ライブ中",
    live_count: "{count} 試合ライブ中",
    view_all: "すべて見る →",
    view_all_matches: "すべての試合を見る",
    share_thoughts: "サッカーについての考えをシェア...",
    post_btn: "投稿",
    trending_posts: "トレンドの投稿",
    tab_all: "すべて",
    tab_following: "フォロー中",
    tab_hot: "🔥 ホット",
    load_more_posts: "さらに投稿を見る",
    upcoming_matches: "今後の試合",
    top_communities: "トップコミュニティ",
    discover: "発見する →",
    predictions_board: "予想リーダーボード",
    view_board: "ボードを見る →",
    join_prediction: "🎯 今すぐ予想に参加する",
    today_stats: "今日の統計",
    stat_live: "ライブ試合",
    stat_new_posts: "新しい投稿",
    stat_predictions: "今日の予想",
    stat_online: "オンラインメンバー"
  }
};

const updateFile = (lang, newContent) => {
  const filePath = path.join(__dirname, `website/messages/${lang}.json`);
  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  data = { ...data, ...newContent };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${lang}.json`);
};

updateFile('vi', newVi);
updateFile('en', newEn);
updateFile('ja', newJa);
