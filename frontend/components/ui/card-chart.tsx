import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardChartProps {
  title: string
  description?: string
  children: React.ReactNode
  chartHeight?: string
  dataInfo?: string
  className?: string
}

export function CardChart({
  title,
  description,
  children,
  chartHeight = "h-64",
  dataInfo,
  className
}: CardChartProps) {
  return (
    <Card className={cn("surface-card card-hover", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={cn("w-full", chartHeight)}>
          <div className="h-full w-full">
            {children}
          </div>
        </div>
        {dataInfo && (
          <div className="mt-3 inline-flex rounded-full border border-border bg-muted/70 px-3 py-1 text-xs text-muted-foreground">
            {dataInfo}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
