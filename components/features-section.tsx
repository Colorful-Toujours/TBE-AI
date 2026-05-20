import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const products = [
  {
    title: "TBE Agent",
    subtitle: "智能财务助手",
    description: "简单指令，高效记账",
    gradient: "from-blue-400 via-cyan-400 to-blue-500",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    title: "发票中心",
    subtitle: "Invoice Hub",
    description: "每张发票都能轻松管理",
    gradient: "from-pink-400 via-rose-400 to-pink-500",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "TBE Audio",
    subtitle: "语音记账",
    description: "说出来，自动记录",
    gradient: "from-violet-400 via-purple-400 to-violet-500",
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-2">全栈产品矩阵</h2>
          <p className="text-muted-foreground">涵盖发票、语音、报表三大方向，助力企业高效管理财务</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product.title}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${product.gradient} p-6 h-64 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl`}
            >
              <div className="absolute top-6 left-6">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  {product.icon}
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-0.5">{product.title}</h3>
                    <p className="text-white/80 text-sm">{product.subtitle}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/20 text-white hover:bg-white/30 hover:text-white"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-white/70 text-sm mt-3">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
