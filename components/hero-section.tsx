import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-tight">
            TBE 智能记账 1.0
          </h1>
          
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            AI 驱动的企业财务管理，让每一笔账目都清晰可见
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-base px-8 rounded-full bg-foreground text-background hover:bg-foreground/90 h-12">
              立即体验
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 rounded-full h-12">
              了解更多
            </Button>
          </div>
        </div>

        {/* Product Cards */}
        <div className="mt-20 sm:mt-28">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground mb-2">核心功能</h2>
            <p className="text-muted-foreground">涵盖发票识别、智能分类、报表生成三大方向，助力企业高效管理财务</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 - Invoice OCR */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-400 via-red-500 to-orange-400 p-6 h-80 cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  NEW
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">发票识别</h3>
                <p className="text-white/80 text-sm mb-3">Invoice OCR</p>
                <p className="text-white/70 text-sm">秒级识别，准确率 99.8%</p>
              </div>
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2 - AI Classification */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-400 via-purple-500 to-indigo-500 p-6 h-80 cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  NEW
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">智能分类</h3>
                <p className="text-white/80 text-sm mb-3">AI Classification</p>
                <p className="text-white/70 text-sm">自动归类，告别手工录入</p>
              </div>
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 3 - Reports */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-300 via-pink-400 to-rose-400 p-6 h-80 cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">报表生成</h3>
                <p className="text-white/80 text-sm mb-3">Auto Reports</p>
                <p className="text-white/70 text-sm">一键导出，多维度分析</p>
              </div>
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 4 - Data Security */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-300 via-orange-400 to-yellow-500 p-6 h-80 cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-1">数据安全</h3>
                <p className="text-white/80 text-sm mb-3">Data Security</p>
                <p className="text-white/70 text-sm">银行级加密，数据无忧</p>
              </div>
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
