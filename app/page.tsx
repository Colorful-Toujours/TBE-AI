import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { StatsSection } from "@/components/how-it-works"
import { Footer } from "@/components/cta-footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />

      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsSection />

        <section id="pricing" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">价格</h2>
              <p className="text-muted-foreground">即将上线，敬请期待。</p>
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-16 lg:py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">关于我们</h2>
              <p className="text-muted-foreground">我们正在把 AI 记账体验做得更简单、更可靠。</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
