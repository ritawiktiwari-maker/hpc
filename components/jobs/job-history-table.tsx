"use client"

import type { Job } from "@/lib/types"
import { formatQuantityWithUnit } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ChevronDown, ChevronRight, Receipt } from "lucide-react"
import { useState, Fragment } from "react"
import { cn } from "@/lib/utils"

interface JobHistoryTableProps {
  jobs: Job[]
}

export function JobHistoryTable({ jobs }: JobHistoryTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No job assignments yet. Assign a job to see it here.
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-10"></TableHead>
            <TableHead>Bill No.</TableHead>
            <TableHead>Employee</TableHead>
            <TableHead>Job Date</TableHead>
            <TableHead className="hidden sm:table-cell">Products</TableHead>
            <TableHead className="hidden md:table-cell">Assigned On</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => {
            const isExpanded = expandedRows.has(job.id)
            const totalItems = job.productsAssigned.reduce((sum, p) => sum + p.quantityGiven, 0)

            return (
              <Fragment key={job.id}>
                <TableRow className="cursor-pointer hover:bg-muted/30" onClick={() => toggleRow(job.id)}>
                  <TableCell>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono flex items-center gap-1 w-fit">
                      <Receipt className="h-3 w-3" />
                      {job.billNumber || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{job.employeeName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{job.employeeId}</p>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(job.jobDate), "dd MMM yyyy")}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="secondary">
                      {job.productsAssigned.length} product{job.productsAssigned.length !== 1 ? "s" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {format(new Date(job.createdAt), "dd MMM yyyy, HH:mm")}
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-muted/20 p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {job.productsAssigned.map((product, idx) => (
                            <div key={idx} className="p-3 bg-background rounded-lg border">
                              <p className="font-medium text-sm">{product.productName}</p>
                              <p className="text-xs text-muted-foreground">{product.productId}</p>
                              <Badge className="mt-2" variant="outline">
                                {formatQuantityWithUnit(product.quantityGiven, product.unit || "pieces")}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        {job.remarks && (
                          <div className={cn("text-sm", "p-3 bg-background rounded-lg border")}>
                            <span className="font-medium">Remarks:</span> {job.remarks}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
