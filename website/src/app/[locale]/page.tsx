'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, Link } from '@/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Trophy, Users, MessageSquare, BookOpen, Star, Sparkles, Activity, ChevronRight, Check, Menu, X, Globe, ChevronUp } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

const IMAGES = [
  "https://images.unsplash.com/photo-1518605368461-1ee7c5320d29?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1431324155629-1a6fc1ac5e52?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551280857-2b9bbe5260fc?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?q=80&w=800&auto=format&fit=crop",
];

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [popupContent, setPopupContent] = useState<'terms' | 'privacy' | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const t = useTranslations('Landing');
  const locale = useLocale();

  const FEATURES = [
    { icon: <Activity />, title: t('feat_1_title'), desc: t('feat_1_desc') },
    { icon: <Users />, title: t('feat_2_title'), desc: t('feat_2_desc') },
    { icon: <Trophy />, title: t('feat_3_title'), desc: t('feat_3_desc') },
    { icon: <BookOpen />, title: t('feat_4_title'), desc: t('feat_4_desc') },
    { icon: <MessageSquare />, title: t('feat_5_title'), desc: t('feat_5_desc') },
    { icon: <Star />, title: t('feat_6_title'), desc: t('feat_6_desc') },
  ];

  // Redirect if logged in
  useEffect(() => {
    if (isAuthenticated) router.replace('/home');
  }, [isAuthenticated, router]);

  // === SCROLL ANIMATIONS ===
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Parallax cho Hero
  const yHero1 = useTransform(smoothProgress, [0, 0.2], [0, -150]);
  const yHero2 = useTransform(smoothProgress, [0, 0.2], [0, -50]);
  const yHero3 = useTransform(smoothProgress, [0, 0.2], [0, 100]);
  const scaleHero = useTransform(smoothProgress, [0, 0.2], [1, 0.9]);
  const opacityHero = useTransform(smoothProgress, [0, 0.15], [1, 0]);

  // Pinned Horizontal Scroll cho Image Gallery
  const horizontalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: horizontalProgress } = useScroll({ target: horizontalRef });
  // Row 1: trượt từ phải sang trái
  const xHorizontalRow1 = useTransform(horizontalProgress, [0, 0.5], ["0vw", "-200vw"]);
  // Row 2: trượt từ trái sang phải
  const xHorizontalRow2 = useTransform(horizontalProgress, [0.5, 1], ["-200vw", "0vw"]);

  // Reveal cho tính năng
  const scaleFeature = useTransform(smoothProgress, [0.3, 0.6], [0.8, 1]);
  const rotateFeature = useTransform(smoothProgress, [0.3, 0.6], [-10, 0]);

  const changeLanguage = (locale: 'vi' | 'en' | 'ja') => {
    router.replace('/', { locale });
    setIsLangMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <div ref={containerRef} className="bg-[#03060a] text-white min-h-[300vh] selection:bg-emerald-500/30 font-sans">

      {/* ── BACKGROUND NOISE & GRADIENT ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-20%] w-[60vw] h-[60vw] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40vw] h-[40vw] bg-teal-600/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay" />
      </div>

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#03060a]/95 backdrop-blur-xl transition-all">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Left: Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain rounded-md group-hover:scale-105 transition-transform" />
              <span className="text-xl font-black tracking-tight">
                <span className="text-white">Pitch</span>
                <span className="text-emerald-400">Grid</span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-10 text-sm font-semibold text-gray-400 shrink-0">
            <a href="#hero" className="hover:text-white transition-colors">{t('nav_about')}</a>
            <a href="#gallery" className="hover:text-white transition-colors">{t('nav_gallery')}</a>
            <a href="#features" className="hover:text-white transition-colors">{t('nav_features')}</a>
            <a href="#premium" className="hover:text-white transition-colors">{t('nav_premium')}</a>
            <a href="#faq" className="hover:text-white transition-colors">{t('nav_faq')}</a>
          </nav>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-4">
            {/* Language Switcher Desktop */}
            <div className="hidden sm:block relative group">
              <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/[0.06] transition-all font-medium text-sm">
                <Globe className="w-4 h-4 mr-1" />
                <span className="uppercase">{locale}</span>
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              <div className="absolute top-full mt-1 right-0 bg-[#0f1923] border border-white/10 rounded-xl p-1 min-w-[100px] opacity-0 group-hover:opacity-100 transition-all pointer-events-none group-hover:pointer-events-auto z-50 shadow-xl before:absolute before:-top-2 before:left-0 before:right-0 before:h-2">
                {(['vi', 'en', 'ja'] as const).map((l) => (
                  <button key={l} onClick={() => changeLanguage(l)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${locale === l ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}>
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white px-4 py-2">{t('nav_login')}</Link>
            <Link href="/register" className="group relative inline-flex items-center justify-center text-sm font-bold text-[#03060a] bg-emerald-400 rounded-xl px-5 py-2.5 overflow-hidden hover:scale-105 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)]">
              {t('nav_register')} <Sparkles className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden absolute top-20 left-0 right-0 bg-[#080d14] border-b border-white/[0.04] p-6 shadow-2xl"
          >
            <nav className="flex flex-col gap-6 text-base font-semibold text-gray-300 mb-8">
              <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-400">{t('nav_about')}</a>
              <a href="#gallery" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-400">{t('nav_gallery')}</a>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-400">{t('nav_features')}</a>
              <a href="#premium" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-400">{t('nav_premium')}</a>
              <a href="#faq" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-emerald-400">{t('nav_faq')}</a>
            </nav>
            <div className="flex flex-col gap-4">
              {/* Mobile Language Switcher */}
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 mb-1">Ngôn ngữ</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['vi', 'en', 'ja'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => changeLanguage(l)}
                      className={`
                        py-2 rounded-xl text-sm font-bold uppercase transition-all
                        ${locale === l ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white/[0.05] text-gray-400 hover:bg-white/10'}
                      `}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <Link href="/login" className="w-full py-3 text-center rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10">
                {t('nav_login')}
              </Link>
              <Link href="/register" className="w-full py-3 text-center rounded-xl bg-emerald-500 text-[#03060a] font-black shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                {t('nav_register_now')}
              </Link>
            </div>
          </motion.div>
        )}
      </header>

      {/* ── 1. HERO SECTION ── */}
      <section id="hero" className="relative z-10 min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div style={{ scale: scaleHero, opacity: opacityHero }} className="w-full max-w-screen-2xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Text */}
          <div className="relative z-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-emerald-400 text-sm font-semibold mb-6 backdrop-blur-md"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> {t('hero_badge')}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] mb-8"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">{t('hero_title_1')} </span>
              <br />
              <span className="relative inline-block">
                <span className="absolute -inset-2 bg-emerald-500/20 blur-xl rounded-full" />
                <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-500">{t('hero_title_2')}</span>
              </span>
              <br />{t('hero_title_3')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
              className="text-xl text-gray-400 max-w-lg mb-10 leading-relaxed"
            >
              {t('hero_desc')}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex gap-4">
              <Link href="/register" className="group relative inline-flex items-center justify-center text-lg font-bold text-white h-16 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-2">{t('hero_explore')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
              </Link>
            </motion.div>
          </div>

          {/* Right: Floating 3D Cards */}
          <div className="relative h-[600px] w-full hidden lg:block perspective-[1000px]">
            {/* Main Center Image */}
            <motion.div style={{ y: yHero1 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[300px] h-[400px] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/20 rotate-[-5deg]">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES[0]} alt="Fan" className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex justify-between text-xs font-bold text-emerald-400 mb-2"><span>UCL FINALS</span> <span className="animate-pulse text-red-500">LIVE</span></div>
                  <div className="text-xl font-black text-white flex justify-between"><span>RMA</span> <span>2-1</span> <span>FCB</span></div>
                </div>
              </div>
            </motion.div>

            {/* Back Right Image */}
            <motion.div style={{ y: yHero2 }} className="absolute top-10 right-0 z-10 w-[250px] h-[320px] rounded-[2rem] overflow-hidden border border-white/5 opacity-80 rotate-[10deg] blur-[1px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES[1]} alt="Fan 2" className="w-full h-full object-cover mix-blend-luminosity" />
            </motion.div>

            {/* Front Left Image */}
            <motion.div style={{ y: yHero3 }} className="absolute bottom-10 left-0 z-30 w-[240px] h-[240px] rounded-[2rem] overflow-hidden border border-emerald-500/30 shadow-2xl rotate-[8deg]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES[2]} alt="Fan 3" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/40 to-transparent mix-blend-overlay" />
            </motion.div>
          </div>

        </motion.div>
      </section>

      {/* ── 2. PINNED HORIZONTAL SCROLL GALLERY ── */}
      <section id="gallery" ref={horizontalRef} className="relative z-10 h-[1000vh] bg-[#03060a]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">

          <div className="text-center mb-10 px-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
              {t('gallery_title')} <span className="text-emerald-400 italic">{t('gallery_title_highlight')}</span>
            </h2>
            <p className="text-gray-400">{t('gallery_desc')}</p>
          </div>

          <div className="flex flex-col gap-6 overflow-visible">
            {/* Row 1: Trượt từ phải sang trái */}
            <motion.div style={{ x: xHorizontalRow1 }} className="flex gap-6 w-fit px-6">
              {[...IMAGES, ...IMAGES].map((img, idx) => (
                <div key={`r1-${idx}`} className="w-[70vw] md:w-[45vw] lg:w-[35vw] h-[250px] shrink-0 rounded-[2rem] overflow-hidden relative group shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                    alt="stadium"
                  />
                  <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/20 mix-blend-overlay transition-colors duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ))}
            </motion.div>

            {/* Row 2: Trượt từ trái sang phải */}
            <motion.div style={{ x: xHorizontalRow2 }} className="flex gap-6 w-fit px-6">
              {[...IMAGES.reverse(), ...IMAGES.reverse()].map((img, idx) => (
                <div key={`r2-${idx}`} className="w-[70vw] md:w-[45vw] lg:w-[35vw] h-[250px] shrink-0 rounded-[2rem] overflow-hidden relative group shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
                    alt="stadium 2"
                  />
                  <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/20 mix-blend-overlay transition-colors duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURES WITH SCROLL REVEAL ── */}
      <section id="features" className="relative z-10 py-32 px-6 bg-[#03060a]">
        <div className="max-w-7xl mx-auto">
          <motion.div style={{ scale: scaleFeature, rotate: rotateFeature }} className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tight" dangerouslySetInnerHTML={{ __html: `${t('features_title')} <span class="text-emerald-400 italic">${t('features_title_highlight')}</span>` }}></h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group relative bg-[#080d14] border border-white/[0.05] rounded-[2rem] p-8 hover:bg-[#0c131c] transition-colors"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. PREMIUM SECTION ── */}
      <section id="premium" className="relative z-10 py-32 px-6">
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1551280857-2b9bbe5260fc?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover opacity-10 mix-blend-luminosity" alt="premium bg" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#03060a] via-[#03060a]/80 to-[#03060a]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">{t('premium_title')} <span className="text-emerald-400 italic">{t('premium_title_highlight')}</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">{t('premium_desc')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#080d14]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 flex flex-col">
              <h3 className="text-2xl font-bold mb-2 text-white">{t('premium_free')}</h3>
              <div className="text-4xl font-black mb-6 text-gray-300">{t('premium_free_price')}</div>
              <ul className="flex-1 space-y-4 mb-8 text-gray-400">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> {t('premium_free_1')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> {t('premium_free_2')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> {t('premium_free_3')}</li>
              </ul>
              <Link href="/register" className="w-full py-4 rounded-xl border border-white/10 text-center font-bold hover:bg-white/5 transition-colors">{t('premium_free_btn')}</Link>
            </motion.div>

            {/* Premium Tier */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="relative bg-gradient-to-b from-emerald-900/40 to-[#080d14]/80 backdrop-blur-xl border border-emerald-500/30 rounded-[2rem] p-10 flex flex-col shadow-[0_0_50px_rgba(52,211,153,0.15)] transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#03060a] text-xs font-black uppercase tracking-wider py-1 px-4 rounded-full">{t('premium_pro_badge')}</div>
              <h3 className="text-2xl font-bold mb-2 text-emerald-400 flex items-center gap-2">{t('premium_pro')} <Star className="w-5 h-5 fill-emerald-400" /></h3>
              <div className="text-4xl font-black mb-2 text-white">{t('premium_pro_price')}<span className="text-lg text-gray-400 font-medium">{t('premium_pro_month')}</span></div>
              <p className="text-emerald-400/80 text-sm mb-6">{t('premium_pro_unlock')}</p>
              <ul className="flex-1 space-y-4 mb-8 text-gray-300">
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> {t('premium_pro_1')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> {t('premium_pro_2')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> {t('premium_pro_3')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> {t('premium_pro_4')}</li>
                <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-400" /> {t('premium_pro_5')}</li>
              </ul>
              <Link href="/register" className="w-full py-4 rounded-xl bg-emerald-500 text-[#03060a] text-center font-black hover:bg-emerald-400 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]">{t('premium_pro_btn')}</Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ / SUPPORT SECTION ── */}
      <section id="faq" className="relative z-10 py-32 px-6 bg-[#03060a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">{t('faq_title')} <span className="text-emerald-400">{t('faq_title_highlight')}</span></h2>
            <p className="text-gray-400">{t('faq_desc')}</p>
          </div>

          <div className="space-y-4">
            {[
              { q: t('faq_q1'), a: t('faq_a1') },
              { q: t('faq_q2'), a: t('faq_a2') },
              { q: t('faq_q3'), a: t('faq_a3') },
              { q: t('faq_q4'), a: t('faq_a4') }
            ].map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 hover:bg-white/[0.04] transition-colors">
                <h4 className="text-xl font-bold text-white mb-3">{faq.q}</h4>
                <p className="text-gray-400 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 backdrop-blur-md">
            <h4 className="text-2xl font-bold text-emerald-400 mb-2">{t('faq_support_title')}</h4>
            <p className="text-gray-400 mb-6">{t('faq_support_desc')}</p>
            <button className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors">{t('faq_support_btn')}</button>
          </div>
        </div>
      </section>

      {/* ── 6. STICKY CALL TO ACTION ── */}
      <section className="relative z-10 h-[150vh]">
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
          {/* Background khổng lồ */}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES[5]} className="w-full h-full object-cover opacity-30" alt="stadium bg" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#03060a] via-[#03060a]/60 to-[#03060a]" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring" }}
            className="relative z-10 text-center max-w-4xl mx-auto px-6"
          >
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-8 shadow-[0_0_80px_rgba(52,211,153,0.6)] animate-bounce">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter">{t('cta_title')}</h2>
            <Link
              href="/register"
              className="group relative inline-flex items-center justify-center text-xl font-black text-[#03060a] h-20 px-12 rounded-3xl bg-emerald-400 overflow-hidden hover:scale-105 transition-all shadow-[0_0_50px_rgba(52,211,153,0.5)]"
            >
              <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-3">
                {t('cta_btn')} <Sparkles className="w-6 h-6" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-20 border-t border-white/[0.05] bg-[#03060a] pt-8 pb-4">
        {/* Hàng trên: Logo & Links */}
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 font-medium mb-6">
          {/* Logo (Trái) */}
          <div className="flex items-center text-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain rounded-md mr-2" />
            <span className="font-bold text-xl tracking-tight">Pitch<span className="text-emerald-400">Grid</span></span>
          </div>

          {/* Links (Phải) */}
          <div className="flex gap-6 text-sm">
            <button onClick={() => setPopupContent('terms')} className="hover:text-emerald-400 transition-colors">Điều khoản Dịch vụ</button>
            <button onClick={() => setPopupContent('privacy')} className="hover:text-emerald-400 transition-colors">Chính sách Bảo mật</button>
          </div>
        </div>

        {/* Hàng dưới: Copyright với viền xám full màn hình */}
        <div className="border-t border-gray-500/30 w-full">
          <div className="max-w-7xl mx-auto px-6 pt-4 text-center text-sm text-gray-500">
            {t('footer_copy')}
          </div>
        </div>
      </footer>

      {/* ── POPUP MODAL ── */}
      <AnimatePresence>
        {popupContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPopupContent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a111a] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                <h3 className="text-2xl font-bold text-white">
                  {popupContent === 'terms' ? 'Điều khoản Dịch vụ' : 'Chính sách Bảo mật'}
                </h3>
                <button
                  onClick={() => setPopupContent(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto text-gray-300 space-y-4 custom-scrollbar">
                {popupContent === 'terms' ? (
                  <>
                    <h4 className="text-lg font-semibold text-emerald-400">1. Chấp nhận điều khoản</h4>
                    <p>Bằng việc truy cập và sử dụng PitchGrid, bạn đồng ý tuân thủ các điều khoản và điều kiện được quy định tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng nền tảng của chúng tôi.</p>
                    <h4 className="text-lg font-semibold text-emerald-400">2. Quyền và Trách nhiệm của Người dùng</h4>
                    <p>Bạn hoàn toàn chịu trách nhiệm về nội dung mà mình đăng tải trên nền tảng. Nghiêm cấm các hành vi đăng tải nội dung phản cảm, vi phạm pháp luật, ngôn từ thù địch, hoặc xâm phạm quyền riêng tư của người khác.</p>
                    <h4 className="text-lg font-semibold text-emerald-400">3. Quyền sở hữu trí tuệ</h4>
                    <p>Mọi nội dung, logo, hình ảnh và mã nguồn trên PitchGrid thuộc quyền sở hữu của PitchGrid hoặc được cấp phép hợp lệ. Không được phép sao chép, phân phối hoặc sử dụng cho mục đích thương mại mà không có sự cho phép bằng văn bản.</p>
                    <h4 className="text-lg font-semibold text-emerald-400">4. Chấm dứt tài khoản</h4>
                    <p>Chúng tôi có quyền đình chỉ hoặc xóa tài khoản của bạn bất cứ lúc nào nếu phát hiện vi phạm các điều khoản này, mà không cần thông báo trước.</p>
                    <h4 className="text-lg font-semibold text-emerald-400">5. Thay đổi điều khoản</h4>
                    <p>PitchGrid có quyền cập nhật hoặc thay đổi Điều khoản Dịch vụ này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang web.</p>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-semibold text-emerald-400">1. Thu thập thông tin</h4>
                    <p>Chúng tôi thu thập các thông tin cơ bản khi bạn đăng ký tài khoản, bao gồm nhưng không giới hạn ở: Tên hiển thị, địa chỉ email, và ảnh đại diện. Ngoài ra, chúng tôi cũng thu thập dữ liệu về cách bạn sử dụng nền tảng (như các trận đấu bạn xem, cộng đồng bạn tham gia) để cá nhân hóa trải nghiệm.</p>
                    <h4 className="text-lg font-semibold text-emerald-400">2. Sử dụng thông tin</h4>
                    <p>Thông tin của bạn được sử dụng để cung cấp dịch vụ, cải thiện trải nghiệm người dùng, hiển thị nội dung phù hợp, và gửi các thông báo quan trọng liên quan đến tài khoản của bạn.</p>
                    <h4 className="text-lg font-semibold text-emerald-400">3. Bảo vệ dữ liệu</h4>
                    <p>PitchGrid cam kết bảo vệ thông tin cá nhân của bạn bằng các biện pháp bảo mật tiêu chuẩn ngành. Tuy nhiên, xin lưu ý rằng không có phương thức truyền tải dữ liệu nào qua internet là hoàn toàn an toàn 100%.</p>
                    <h4 className="text-lg font-semibold text-emerald-400">4. Chia sẻ thông tin</h4>
                    <p>Chúng tôi không bán, trao đổi hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Thông tin chỉ có thể được chia sẻ khi có yêu cầu hợp pháp từ cơ quan chức năng hoặc khi cần thiết để bảo vệ quyền lợi hợp pháp của PitchGrid.</p>
                    <h4 className="text-lg font-semibold text-emerald-400">5. Quyền của người dùng</h4>
                    <p>Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu cá nhân của mình bất cứ lúc nào bằng cách liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.</p>
                  </>
                )}
              </div>
              <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end">
                <button
                  onClick={() => setPopupContent(null)}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#03060a] font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Đã hiểu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SCROLL TO TOP BUTTON ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[90] p-4 rounded-full bg-emerald-400 text-[#03060a] shadow-[0_0_30px_rgba(52,211,153,0.6)] hover:shadow-[0_0_50px_rgba(52,211,153,0.8)] hover:bg-emerald-300 hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
            aria-label="Cuộn lên đầu trang"
          >
            <ChevronUp className="w-6 h-6 stroke-[3]" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
