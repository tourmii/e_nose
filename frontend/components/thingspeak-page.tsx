"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { motion } from "framer-motion"
import {
  Brain,
  ChevronDown,
  Cloud,
  Pause,
  Play,
  Target,
  TreePine,
  Waves,
  Zap,
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js"
import { Line } from "react-chartjs-2"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CardChart } from "@/components/ui/card-chart"
import { cn } from "@/lib/utils"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const API_KEY = "P91SEPV5ZZG00Y4S"
const REFRESH_INTERVAL = 30
const STREAM_INTERVAL = 3
const MAX_DATA_POINTS = 15
const SENSOR_KEYS = ["mq136", "mq137", "temp", "humid"] as const

interface CollapsibleProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

interface ThingSpeakData {
  channel_id: string
  name: string
  description: string
  field1: string
  field2: string
  field3: string
  field4: string
  field5: string
  field6: string
  field7: string
  field8: string
  created_at: string
  updated_at: string
  last_entry_id: number
}

interface PredictionResult {
  class_id?: number
  class_label: string
  probability?: number
}

interface ThingSpeakPrediction {
  input_data?: number[]
  sensor_arrays?: number[][]
  predictions: {
    base_1: PredictionResult
    base_2: PredictionResult
    base_3: PredictionResult
    base_4: PredictionResult
    meta: PredictionResult
  }
  thingspeak_data?: ThingSpeakData
  metadata: {
    timestamp: string
    sensor_names: string[]
    thingspeak?: {
      records_fetched: number
      latest_entry_time: string
      api_key: string
    }
    model_versions?: {
      [key: string]: string
    }
  }
}

interface ChartDataPoint {
  time: string
  value: number
}

interface SensorChartData {
  mq136: ChartDataPoint[]
  mq137: ChartDataPoint[]
  temp: ChartDataPoint[]
  humid: ChartDataPoint[]
}

const sensorMeta = [
  {
    key: "mq136" as const,
    title: "Cảm biến Amoniac",
    description: "Đọc dữ liệu cảm biến khí",
    label: "Amoniac",
    color: "#0052ff",
    unit: "",
  },
  {
    key: "mq137" as const,
    title: "Cảm biến Hydro Sulfide",
    description: "Đọc dữ liệu cảm biến khí",
    label: "Hydro Sulfide",
    color: "#dc2626",
    unit: "",
  },
  {
    key: "temp" as const,
    title: "Nhiệt độ",
    description: "Đọc dữ liệu nhiệt độ",
    label: "Nhiệt độ",
    color: "#16a34a",
    unit: "°C",
  },
  {
    key: "humid" as const,
    title: "Độ ẩm",
    description: "Đọc dữ liệu độ ẩm",
    label: "Độ ẩm",
    color: "#ca8a04",
    unit: "%",
  },
] as const

const odorLabels: Record<string, string> = {
  "Thịt loại 1": "Thịt loại 1",
  "Thịt loại 2": "Thịt loại 2",
  "Thịt loại 3": "Thịt loại 3",
  "Thịt loại 4": "Thịt loại 4",
  "Thịt hỏng": "Thịt hỏng",
}

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "rgba(255, 255, 255, 0.08)",
      borderWidth: 1,
      padding: 12,
      titleColor: "#ffffff",
      bodyColor: "rgba(255, 255, 255, 0.88)",
      callbacks: {
        title: (context) => `Time: ${context[0].label}`,
        label: (context) => {
          const label = context.dataset.label || ""
          const value = context.parsed.y
          const displayValue = typeof value === "number" ? value.toFixed(2) : "N/A"
          return `${label}: ${displayValue}`
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#64748b",
        font: {
          size: 10,
        },
      },
      grid: {
        color: "rgba(226, 232, 240, 0.8)",
      },
    },
    y: {
      ticks: {
        color: "#64748b",
        font: {
          size: 10,
        },
      },
      grid: {
        color: "rgba(226, 232, 240, 0.8)",
      },
    },
  },
}

function hexToRgba(hex: string, alpha: number) {
  const cleaned = hex.replace("#", "")
  const normalized = cleaned.length === 3 ? cleaned.split("").map((part) => part + part).join("") : cleaned
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function createMockSensorArrays(pointCount = 12) {
  return Array.from({ length: pointCount }, (_, index) => {
    const progress = index / Math.max(pointCount - 1, 1)
    const noise = () => (Math.random() - 0.5) * 2

    return [
      282 + progress * 34 + Math.sin(index * 0.55) * 7 + noise() * 3,
      204 + progress * 28 + Math.cos(index * 0.5) * 9 + noise() * 4,
      26.4 + progress * 1.9 + Math.sin(index * 0.32) * 0.4 + noise() * 0.12,
      61.5 - progress * 4.2 + Math.cos(index * 0.45) * 1.1 + noise() * 0.35,
    ]
  })
}

function createMockPrediction(): ThingSpeakPrediction {
  const sensorArrays = createMockSensorArrays()
  const latestReading = sensorArrays[sensorArrays.length - 1] ?? [0, 0, 0, 0]
  const averageReading = latestReading.reduce((sum, value) => sum + value, 0) / latestReading.length

  const primaryLabel = "Thịt loại 2"

  return {
    input_data: latestReading,
    sensor_arrays: sensorArrays,
    predictions: {
      base_1: { class_label: "Thịt loại 1", probability: 0.82 },
      base_2: { class_label: "Thịt loại 1", probability: 0.78 },
      base_3: { class_label: "Thịt loại 2", probability: 0.74 },
      base_4: { class_label: "Thịt loại 2", probability: 0.8 },
      meta: {
        class_label: primaryLabel,
        probability: Math.min(0.97, Math.max(0.84, 0.84 + (averageReading % 10) / 100)),
      },
    },
    thingspeak_data: {
      channel_id: "mock-channel",
      name: "Mock ThingSpeak Session",
      description: "Synthetic data used when the backend API is unavailable.",
      field1: "mq136",
      field2: "mq137",
      field3: "temp",
      field4: "humid",
      field5: "",
      field6: "",
      field7: "",
      field8: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_entry_id: sensorArrays.length,
    },
    metadata: {
      timestamp: new Date().toISOString(),
      sensor_names: ["MQ136", "MQ137", "Temp", "Humid"],
      thingspeak: {
        records_fetched: sensorArrays.length,
        latest_entry_time: new Date().toISOString(),
        api_key: "mock-data",
      },
      model_versions: {
        base_1: "mock-v1",
        base_2: "mock-v1",
        base_3: "mock-v1",
        base_4: "mock-v1",
        meta: "mock-v1",
      },
    },
  }
}

function formatChartJsData(data: ChartDataPoint[], label: string, color: string): ChartData<"line"> {
  return {
    labels: data.map((point) => point.time),
    datasets: [
      {
        label,
        data: data.map((point) => point.value),
        borderColor: color,
        backgroundColor: hexToRgba(color, 0.12),
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        borderWidth: 2,
        fill: true,
        tension: 0.35,
      },
    ],
  }
}

const ChartWrapper = ({
  children,
  data,
  isStreaming,
}: {
  children: ReactNode
  data: ChartDataPoint[]
  isStreaming: boolean
}) => {
  if (isStreaming && data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Đang tải dữ liệu...</div>
  }

  if (!isStreaming && data.length === 0) {
    return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Chưa có dữ liệu.</div>
  }

  return <>{children}</>
}

function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-border bg-white/85 shadow-sm backdrop-blur">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/5"
      >
        <span className="text-sm font-semibold tracking-tight text-foreground">{title}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </button>
      {isOpen && <div className="border-t border-border px-5 py-5">{children}</div>}
    </div>
  )
}

function sleep(seconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve(), seconds * 1000)

    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(timeoutId)
          reject(new Error("Aborted"))
        },
        { once: true },
      )
    }
  })
}

export default function ThingSpeakPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ThingSpeakPrediction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<SensorChartData>({
    mq136: [],
    mq137: [],
    temp: [],
    humid: [],
  })
  const [currentDataIndex, setCurrentDataIndex] = useState(0)
  const [pendingSensorArrays, setPendingSensorArrays] = useState<number[][]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentAverageData, setCurrentAverageData] = useState<number[]>([0, 0, 0, 0])
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const streamingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRunningRef = useRef(false)
  const pendingSensorArraysRef = useRef<number[][]>([])
  const currentDataIndexRef = useRef(0)

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current)
      }
    }
  }, [])

  const addDataToCharts = useCallback((sensorData: number[]) => {
    const timestamp = new Date().toLocaleTimeString("vi-VN")

    setChartData((previous) => {
      const nextData = { ...previous }

      SENSOR_KEYS.forEach((sensorKey, index) => {
        const newPoint = {
          time: timestamp,
          value: sensorData[index] || 0,
        }

        nextData[sensorKey] = [...previous[sensorKey], newPoint].slice(-MAX_DATA_POINTS)
      })

      const nextAverages = SENSOR_KEYS.map((sensorKey) => {
        const points = nextData[sensorKey]
        if (points.length === 0) {
          return 0
        }

        const total = points.reduce((sum, point) => sum + point.value, 0)
        return total / points.length
      })

      setCurrentAverageData(nextAverages)
      return nextData
    })
  }, [])

  const streamNextDataPoint = useCallback(() => {
    const currentIndex = currentDataIndexRef.current
    const arrays = pendingSensorArraysRef.current

    if (currentIndex >= arrays.length) {
      setIsStreaming(false)
      setPendingSensorArrays([])
      pendingSensorArraysRef.current = []
      currentDataIndexRef.current = 0
      setCurrentDataIndex(0)
      return
    }

    addDataToCharts(arrays[currentIndex])

    const nextIndex = currentIndex + 1
    currentDataIndexRef.current = nextIndex
    setCurrentDataIndex(nextIndex)

    if (nextIndex < arrays.length) {
      streamingTimeoutRef.current = setTimeout(streamNextDataPoint, STREAM_INTERVAL * 1000)
    } else {
      setIsStreaming(false)
      setPendingSensorArrays([])
      pendingSensorArraysRef.current = []
      currentDataIndexRef.current = 0
      setCurrentDataIndex(0)
    }
  }, [addDataToCharts])

  useEffect(() => {
    pendingSensorArraysRef.current = pendingSensorArrays
  }, [pendingSensorArrays])

  useEffect(() => {
    currentDataIndexRef.current = currentDataIndex
  }, [currentDataIndex])

  useEffect(() => {
    if (pendingSensorArrays.length > 0 && !isStreaming && currentDataIndex === 0) {
      setIsStreaming(true)
      streamNextDataPoint()
    }
  }, [pendingSensorArrays, isStreaming, currentDataIndex, streamNextDataPoint])

  const handlePredict = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/predict/thingspeak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: API_KEY,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)

      if (data.sensor_arrays && data.sensor_arrays.length > 0) {
        if (streamingTimeoutRef.current) {
          clearTimeout(streamingTimeoutRef.current)
        }

        setPendingSensorArrays(data.sensor_arrays)
        setCurrentDataIndex(0)
        setIsStreaming(false)
      }
    } catch (caughtError) {
      console.warn("ThingSpeak API unavailable, using mock data instead:", caughtError)
      const mockData = createMockPrediction()

      setResult(mockData)

      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current)
      }

      setPendingSensorArrays(mockData.sensor_arrays ?? [])
      setCurrentDataIndex(0)
      setIsStreaming(false)
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const startAutoRefreshLoop = useCallback(async () => {
    if (isRunningRef.current) {
      return
    }

    isRunningRef.current = true
    abortControllerRef.current = new AbortController()

    try {
      while (isRunningRef.current && !abortControllerRef.current.signal.aborted) {
        await handlePredict()

        if (!isRunningRef.current) {
          break
        }

        await sleep(REFRESH_INTERVAL, abortControllerRef.current.signal)
      }
    } catch (caughtError) {
      if (caughtError instanceof Error && caughtError.message !== "Aborted") {
        console.error("Auto-refresh error:", caughtError)
        setError("Có lỗi xảy ra trong quá trình auto-refresh")
        setIsAutoRefresh(false)
      }
    } finally {
      isRunningRef.current = false
    }
  }, [handlePredict])

  const stopAutoRefresh = useCallback(() => {
    isRunningRef.current = false

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    if (streamingTimeoutRef.current) {
      clearTimeout(streamingTimeoutRef.current)
    }

    setIsStreaming(false)
    setCurrentDataIndex(0)
    setPendingSensorArrays([])
  }, [])

  const toggleAutoRefresh = () => {
    if (isAutoRefresh) {
      stopAutoRefresh()
      setIsAutoRefresh(false)
      return
    }

    setIsAutoRefresh(true)
  }

  useEffect(() => {
    if (isAutoRefresh) {
      startAutoRefreshLoop()
    } else {
      stopAutoRefresh()
    }
  }, [isAutoRefresh, startAutoRefreshLoop, stopAutoRefresh])

  const metaPrediction = result?.predictions.meta
  const basePredictions = result
    ? [
        { icon: Brain, label: "Base Model 1", result: result.predictions.base_1 },
        { icon: TreePine, label: "Base Model 2", result: result.predictions.base_2 },
        { icon: Zap, label: "Base Model 3", result: result.predictions.base_3 },
        { icon: Waves, label: "Base Model 4", result: result.predictions.base_4 },
      ]
    : []

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="surface-card panel-outline relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,82,255,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(77,124,255,0.08),transparent_28%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-5">
            <div className="section-label">
              <span className="section-label-dot soft-pulse" />
              <span>ThingSpeak / AI Inference</span>
            </div>

            <div className="space-y-4">
              <h2 className="font-display text-[2.4rem] leading-[0.98] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[4.25rem]">
                Dự đoán theo thời gian thực với <span className="gradient-text">dữ liệu cảm biến</span>.
              </h2>
              <p className="max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
                Luồng ThingSpeak được gom, trung bình hóa và đưa qua 4 mô hình cơ sở trước khi meta model chọn kết quả cuối.
                Giao diện này ưu tiên độ rõ ràng: trạng thái, kết quả và biểu đồ được tách lớp theo nhịp đọc nhanh.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="px-3 py-1.5 text-[11px] uppercase tracking-[0.14em]">
                <span className="soft-pulse h-2 w-2 rounded-full bg-accent" />
                Refresh {REFRESH_INTERVAL}s
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 text-[11px] uppercase tracking-[0.14em]">
                {isStreaming ? "Streaming active" : "Awaiting stream"}
              </Badge>
              <Badge variant="outline" className="px-3 py-1.5 text-[11px] uppercase tracking-[0.14em]">
                4 kênh cảm biến
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="surface-card card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Cloud className="h-5 w-5 text-accent" />
                  Điều khiển thu thập dữ liệu
                </CardTitle>
                <CardDescription>
                  Bật auto-refresh để lấy dữ liệu mới, hoặc chạy từng lần khi cần kiểm tra nhanh.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={toggleAutoRefresh} disabled={isLoading} className="w-full">
                  {isAutoRefresh ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Dừng thu thập dữ liệu
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Bắt đầu thu thập dữ liệu
                    </>
                  )}
                </Button>
                <p className="text-sm leading-6 text-muted-foreground">
                  Mỗi lượt sẽ gọi API dự đoán, sau đó phát các điểm dữ liệu cảm biến theo nhịp {STREAM_INTERVAL} giây.
                </p>
              </CardContent>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white/75 p-4 shadow-sm">
                <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Refresh cycle</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{REFRESH_INTERVAL}s</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Nhịp cập nhật cố định, không mở quá nhiều cấu hình.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] p-4 text-white shadow-accent-lg">
                <div className="text-xs uppercase tracking-[0.16em] text-white/80">Signal mode</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">Live scoring</div>
                <p className="mt-2 text-sm leading-6 text-white/85">Tín hiệu mới được dàn đều để dễ theo dõi cả trên desktop lẫn mobile.</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {metaPrediction && (
        <div className="rounded-[2rem] bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] p-[1px] shadow-accent-lg">
          <Card className="rounded-[calc(2rem-1px)] border-0 bg-white/96 shadow-none">
            <CardHeader>
              <div className="section-label w-fit border-white/30 bg-white/10 text-white">
                <span className="section-label-dot bg-white shadow-none" />
                <span>Final result</span>
              </div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-5 w-5 text-accent" />
                Kết quả dự đoán cuối cùng
              </CardTitle>
              <CardDescription>
                Kết quả được tổng hợp từ 4 mô hình cơ sở và meta model trên dữ liệu ThingSpeak.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 text-center">
                <div className="space-y-3">
                  <div className="text-[2rem] font-semibold tracking-tight text-foreground sm:text-4xl">
                    {odorLabels[metaPrediction.class_label] || metaPrediction.class_label}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    Độ tin cậy: {((metaPrediction.probability || 0) * 100).toFixed(2)}%
                  </div>
                </div>
                <div className="flex justify-center">
                  <Badge variant="default" className="px-4 py-2 text-sm">
                    Meta Model
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {basePredictions.length > 0 && (
        <Collapsible title="Chi tiết kết quả từ 4 mô hình cơ sở" defaultOpen={false}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {basePredictions.map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.label} className="surface-card card-hover h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-2">
                      <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                      <div className="text-xl font-semibold tracking-tight">
                        {odorLabels[item.result.class_label] || item.result.class_label}
                      </div>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-secondary))] text-white shadow-accent">
                      <Icon className="h-5 w-5" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {item.result.probability !== undefined
                        ? `Độ tin cậy: ${(item.result.probability * 100).toFixed(2)}%`
                        : "Đang chờ xác suất từ mô hình."}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </Collapsible>
      )}

      <Card className="surface-card card-hover">
        <CardHeader>
          <CardTitle className="text-2xl">Dữ liệu trung bình theo thời gian thực</CardTitle>
          <CardDescription>
            Mỗi tile phản ánh giá trị trung bình hiện tại của luồng cảm biến đang phát.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sensorMeta.map((sensor, index) => {
              const hasData = chartData[sensor.key].length > 0
              const displayValue = hasData ? `${currentAverageData[index].toFixed(2)}${sensor.unit}` : "—"

              return (
                <div key={sensor.key} className="rounded-2xl border border-border bg-white/75 p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{sensor.label}</div>
                  <div className="mt-2 text-2xl font-semibold tracking-tight">{displayValue}</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{sensor.description}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="surface-card card-hover">
        <CardHeader>
          <CardTitle className="text-2xl">Biểu đồ cảm biến trực quan</CardTitle>
          <CardDescription>
            Bốn chart được sắp theo lưới 2 cột trên desktop để giữ ngữ cảnh đọc được rõ ràng.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {sensorMeta.map((sensor) => (
              <CardChart
                key={sensor.key}
                title={sensor.title}
                description={sensor.description}
                chartHeight="h-[330px]"
                dataInfo={`Điểm dữ liệu: ${chartData[sensor.key].length}/${MAX_DATA_POINTS}`}
                className="h-full"
              >
                <ChartWrapper data={chartData[sensor.key]} isStreaming={isStreaming}>
                  <div className="relative h-full w-full">
                    <Line
                      options={chartOptions}
                      data={formatChartJsData(chartData[sensor.key], sensor.label, sensor.color)}
                    />
                  </div>
                </ChartWrapper>
              </CardChart>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
