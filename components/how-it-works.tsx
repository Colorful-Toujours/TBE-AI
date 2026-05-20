const stats = [
  { value: "10,000+", label: "企业客户" },
  { value: "99.8%", label: "识别准确率" },
  { value: "5亿+", label: "累计处理发票" },
  { value: "50+", label: "覆盖城市" },
]

export function StatsSection() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-zinc-900 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          <div className="lg:w-1/2">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-4">TBE</h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              致力于成为面向企业与财务人员的开放平台，
              共同为全球用户提供极致的智能记账体验。
            </p>
          </div>
          
          <div className="lg:w-1/2 grid grid-cols-2 gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
