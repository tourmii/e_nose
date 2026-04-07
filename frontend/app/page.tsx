"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Brain, Database, ShieldCheck, Sparkles, Waves } from "lucide-react"

import ThingSpeakPage from "../components/thingspeak-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const easeOut = [0.16, 1, 0.3, 1] as const

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
}

const stats = [
  {
    title: "Tổng số cảm biến",
    value: "4",
    description: "Cảm biến khí, nhiệt độ và độ ẩm được hợp nhất trong một luồng dữ liệu.",
    icon: Waves,
  },
  {
    title: "Mô hình AI",
    value: "5",
    description: "4 mô hình cơ sở và 1 meta model để tăng độ tin cậy đầu ra.",
    icon: Brain,
  },
  {
    title: "Loại mùi",
    value: "5",
    description: "Từ thịt loại 1 đến thịt hỏng, hệ thống phân biệt theo ngữ cảnh thực tế.",
    icon: Database,
  },
  {
    title: "Độ chính xác",
    value: "97.61%",
    description: "Kết quả meta model trên tập test phản ánh hiệu quả tổng hợp.",
    icon: ShieldCheck,
  },
]

const workflow = [
  "Chuyển sang tab ThingSpeak để bắt đầu luồng dữ liệu.",
  "Nhấn nút thu thập để lấy mẫu mới từ kênh cảm biến.",
  "Theo dõi các chỉ số trung bình và 4 biểu đồ thời gian thực.",
  "Đọc kết quả từ 4 mô hình cơ sở và meta model tổng hợp.",
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_left,rgba(0,82,255,0.14),transparent_40%),radial-gradient(circle_at_top_right,rgba(77,124,255,0.1),transparent_34%)]" />
      <div className="pointer-events-none absolute left-10 top-16 hidden h-28 w-28 rounded-full border border-accent/15 lg:block" />
      <div className="pointer-events-none absolute right-10 top-32 hidden h-20 w-20 rounded-full border border-accent/10 lg:block" />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <motion.section
          className="surface-card panel-outline relative rounded-[2rem] p-6 sm:p-8 lg:p-10"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="section-label">
                <span className="section-label-dot soft-pulse" />
                <span>Electronic Nose Platform</span>
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-[2.8rem] leading-[0.95] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[5rem]">
                  Mũi điện tử cho <span className="gradient-text">phân tích thực phẩm</span> thông minh.
                </h1>
                <p className="max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
                  Sensetify kết hợp cảm biến khí, nhiệt độ, độ ẩm và mô hình AI để biến tín hiệu môi trường thành
                  quyết định rõ ràng về chất lượng thịt, theo một giao diện gọn, sáng và có nhịp điệu.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" onClick={() => setActiveTab("thingspeak")}>
                  Mở ThingSpeak
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => setActiveTab("home")}>
                  Xem tổng quan
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "4 cảm biến đầu vào",
                  "5 lớp dự đoán AI",
                  "Luồng dữ liệu 30 giây",
                ].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
              <div className="surface-card relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,82,255,0.16),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(77,124,255,0.12),transparent_28%)]" />
                <div className="pointer-events-none absolute inset-0 data-grid opacity-30" />

                <div className="relative flex h-full flex-col justify-between gap-5">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-accent/15 bg-white/80 px-3 py-1 text-xs font-medium text-accent shadow-sm">
                      <span className="soft-pulse h-2 w-2 rounded-full bg-accent" />
                      Live system status
                    </div>
                    <div className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs text-muted-foreground">
                      ThingSpeak / AI / Dashboard
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {[
                      { label: "Sensor signal", value: "Stable", tone: "text-emerald-600" },
                      { label: "Refresh interval", value: "30s", tone: "text-accent" },
                      { label: "Decision layer", value: "Meta Model", tone: "text-slate-900" },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="floating-bob rounded-2xl border border-border bg-white/85 p-4 shadow-sm backdrop-blur"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 5 + index * 0.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.label}</div>
                            <div className={`mt-2 text-2xl font-semibold tracking-tight ${item.tone}`}>{item.value}</div>
                          </div>
                          <div className="h-11 w-11 rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] shadow-accent" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border bg-white/75 p-4 shadow-sm">
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Pipeline</div>
                      <div className="mt-2 text-lg font-semibold tracking-tight">Streaming inference</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Dữ liệu được lấy theo nhịp đều, sau đó tổng hợp để đưa vào mô hình meta.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] p-4 text-white shadow-accent-lg">
                      <div className="text-xs uppercase tracking-[0.16em] text-white/80">Accuracy</div>
                      <div className="mt-2 text-3xl font-semibold tracking-tight">97.61%</div>
                      <p className="mt-2 text-sm leading-6 text-white/85">
                        Thiết kế để hiển thị rõ tín hiệu quan trọng, không phải nhiều thứ cùng lúc.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mx-auto">
              <TabsTrigger value="home">Trang chủ</TabsTrigger>
              <TabsTrigger value="thingspeak">ThingSpeak</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="home" className="mt-8">
                {activeTab === "home" && (
                  <motion.div
                    key="home"
                    className="space-y-6"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                  >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      {stats.map((item, index) => {
                        const Icon = item.icon

                        return (
                          <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.06 }}
                          >
                            <Card className="surface-card card-hover h-full">
                              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-2">
                                  <div className="section-label w-fit px-3 py-1 text-[11px]">
                                    <span className="section-label-dot h-2 w-2" />
                                    <span>{item.title}</span>
                                  </div>
                                  <CardTitle className="text-3xl font-semibold tracking-tight">{item.value}</CardTitle>
                                </div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] text-white shadow-accent">
                                  <Icon className="h-5 w-5" />
                                </div>
                              </CardHeader>
                              <CardContent>
                                <CardDescription className="text-sm leading-6">{item.description}</CardDescription>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
                      <Card className="surface-card card-hover">
                        <CardHeader>
                          <CardTitle className="text-2xl">Giới thiệu hệ thống</CardTitle>
                          <CardDescription>Sensetify kết nối phần cứng, giao tiếp dữ liệu và mô hình dự đoán trong một nhịp vận hành rõ ràng.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm leading-7 text-muted-foreground">
                            Hệ thống mũi điện tử sử dụng 4 cảm biến để phát hiện và phân loại mùi thịt. Dữ liệu từ ThingSpeak được
                            xử lý bởi 5 mô hình AI để tạo ra dự đoán cuối cùng với độ tin cậy cao hơn so với một mô hình đơn lẻ.
                          </p>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {[
                              "Cảm biến khí để nhận tín hiệu bay hơi",
                              "Cảm biến nhiệt độ và độ ẩm để giữ ngữ cảnh môi trường",
                              "4 mô hình cơ sở để so sánh theo nhiều chiến lược",
                              "Meta model để tổng hợp và chọn kết quả ổn định hơn",
                            ].map((item) => (
                              <div key={item} className="rounded-2xl border border-border bg-white/75 px-4 py-3 text-sm leading-6 text-foreground shadow-sm">
                                {item}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="surface-card card-hover">
                        <CardHeader>
                          <CardTitle className="text-2xl">Luồng sử dụng</CardTitle>
                          <CardDescription>Quy trình được rút gọn thành bốn bước, dễ đọc trên màn hình lớn lẫn di động.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {workflow.map((step, index) => (
                            <div key={step} className="flex gap-4 rounded-2xl border border-border bg-white/75 p-4 shadow-sm">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] text-sm font-semibold text-white shadow-accent">
                                {index + 1}
                              </div>
                              <p className="text-sm leading-6 text-muted-foreground">{step}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="thingspeak" className="mt-8">
                {activeTab === "thingspeak" && (
                  <motion.div
                    key="thingspeak"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: easeOut }}
                  >
                    <ThingSpeakPage />
                  </motion.div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </main>
  )
}
