"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Activity } from "@/lib/types"
import { Users, Package, ClipboardList, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface ActivityLogProps {
  activities: Activity[]
}

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "employee_added":
    case "employee_updated":
    case "employee_deleted":
      return Users
    case "product_added":
    case "product_updated":
    case "product_deleted":
      return Package
    case "job_assigned":
      return ClipboardList
    default:
      return Clock
  }
}

const getActivityColor = (type: Activity["type"]) => {
  if (type.includes("added")) return "text-success bg-success/10"
  if (type.includes("deleted")) return "text-destructive bg-destructive/10"
  if (type.includes("updated")) return "text-chart-2 bg-chart-2/10"
  return "text-primary bg-primary/10"
}

export function ActivityLog({ activities }: ActivityLogProps) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          activities.slice(0, 10).map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const colorClass = getActivityColor(activity.type)
            return (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className={cn("p-2 rounded-lg shrink-0", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
