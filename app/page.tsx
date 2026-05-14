"use client";

import Link from "next/link";
import { useState } from "react";
import Image from 'next/image'
import {
  ChevronRight,
  Menu,
  X,
  Wallet,
  Scan,
  PieChart,
  Cpu,
  TrendingUp,
  Globe,
} from "lucide-react";

const AILedgerLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: '首页', href: '#' },
    { name: '功能', href: '#' },
    { name: '价格', href: '#' },
    { name: '关于我们', href: '#' },
  ];

  const heroFeatures = [
    { icon: <Scan className="w-5 h-5 text-red-600" />, title: '智能扫描', sub: '拍照秒录，自动分类' },
    { icon: <PieChart className="w-5 h-5 text-red-600" />, title: '深度分析', sub: 'AI 洞察你的消费习惯' },
    { icon: <Cpu className="w-5 h-5 text-red-600" />, title: '自动同步', sub: '多平台收支一键掌握' },
  ];

  const productMatrix = [
    { title: "AI Ledger Pro", version: "V2.7", color: "bg-red-500", tag: "NEW" },
    { title: "Smart Voice", version: "V2.6", color: "bg-indigo-600", tag: "NEW" },
    { title: "Global Sync", version: "V2.8", color: "bg-amber-400", tag: "HOT" },
    { title: "Enterprise", version: "M2-her", color: "bg-red-600", tag: "NEW" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                {/* <Wallet size={20} /> */}
                <Image src={'/TBE.png'} alt="TBE"  width="64" height="64"  />
              </div>
              <span className="text-xl font-black tracking-tighter">AI LEDGER</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-10 text-sm font-medium text-gray-500">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="hover:text-black transition-colors">
                  {link.name}
                </a>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button className="text-sm font-medium px-4 py-2">EN</button>
              <Link
                href="/login"
                className="text-sm font-medium bg-gray-100 px-6 py-2 rounded-full hover:bg-gray-200 transition-all"
              >
                登录
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
          {isMenuOpen ? (
            <div className="md:hidden border-t border-gray-100 py-4">
              <div className="flex flex-col gap-3 text-sm font-medium text-gray-500">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="rounded-xl px-3 py-2 hover:bg-gray-50 hover:text-black"
                  >
                    {link.name}
                  </a>
                ))}
                <Link
                  href="/login"
                  className="mt-2 rounded-full bg-gray-900 px-5 py-3 text-center font-bold text-white"
                >
                  登录
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Smart <span className="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-xl mx-2">
              <TrendingUp size={28} />
            </span> Ledger
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto font-medium">
            专为财务极客定制的超高性价比 AI 记账方案，让每一分钱都有迹可循。
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button className="bg-gray-900 text-white px-10 py-4 rounded-full font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all">
              立即开始体验
            </button>
            <button className="border-2 border-gray-200 bg-white px-10 py-4 rounded-full font-bold text-sm hover:border-gray-900 transition-all">
              查看演示
            </button>
          </div>

          <div className="relative max-w-5xl mx-auto mt-20">
            {/* Background Accent Box */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-orange-500 rounded-[3rem] -rotate-1 scale-[1.02] opacity-10 blur-3xl"></div>
            
            <div className="relative bg-gradient-to-r from-red-500 to-red-600 rounded-[2.5rem] p-12 overflow-hidden shadow-2xl shadow-red-200">
              {/* Abstract decorative shapes */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-20 -mb-20 blur-xl"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {heroFeatures.map((f, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 flex flex-col items-center text-center shadow-lg transform hover:scale-105 transition-transform">
                    <div className="mb-4 p-3 bg-red-50 rounded-2xl">
                      {f.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{f.title}</h3>
                    <p className="text-xs text-gray-400 font-medium">{f.sub}</p>
                  </div>
                ))}
              </div>

              {/* Slider Dots */}
              <div className="flex justify-center gap-2 mt-8">
                {[1,2,3,4,5].map(dot => (
                  <div key={dot} className={`h-1.5 rounded-full transition-all ${dot === 1 ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section className="mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black mb-2">全栈 AI 财务矩阵</h2>
              <p className="text-gray-400 font-medium text-sm">涵盖消费、投资、资产、负债与税务五大方向。助力用户高效理清财务状况。</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50"><ChevronRight size={20} className="rotate-180" /></button>
              <button className="p-2 border border-gray-200 rounded-full hover:bg-gray-50"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {productMatrix.map((item, idx) => (
              <div key={idx} className="group relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all">
                <div className={`absolute inset-0 ${item.color} opacity-90 group-hover:scale-110 transition-transform duration-500`}></div>
                
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-10 right-10 w-20 h-20 border-2 border-white rounded-full"></div>
                  <div className="absolute bottom-10 left-10 w-40 h-40 border border-white/40 rounded-full"></div>
                </div>

                <div className="relative h-full p-6 flex flex-col justify-end text-white">
                  <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    {item.tag}
                  </span>
                  <h3 className="text-2xl font-black leading-tight mb-1">{item.title}</h3>
                  <p className="text-lg font-bold opacity-80">{item.version}</p>
                </div>
              </div>
            ))}
            
            {/* Last item can be different or empty to match the layout aesthetic */}
            <div className="hidden lg:block group relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
              <div className="p-4 bg-white rounded-2xl shadow-sm mb-4">
                <Globe size={32} />
              </div>
              <p className="font-bold text-sm">敬请期待</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 pt-20 pb-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                  <Wallet size={18} />
                </div>
                <span className="text-lg font-black tracking-tighter">AI LEDGER</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                重新定义智能时代的个人记账方式。我们相信更好的财务透明度能带来更自由的生活。
              </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm font-medium">
            <div className="flex flex-col gap-4">
              <span className="text-black uppercase tracking-widest text-[10px] font-bold">产品</span>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">移动端</a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">API</a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">浏览器扩展</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-black uppercase tracking-widest text-[10px] font-bold">公司</span>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">关于我们</a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">加入我们</a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">新闻</a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-black uppercase tracking-widest text-[10px] font-bold">法律</span>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">隐私政策</a>
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">服务协议</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
          © 2024 AI Ledger Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AILedgerLanding;
