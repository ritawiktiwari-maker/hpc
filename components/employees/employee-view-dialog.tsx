"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Employee } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface EmployeeViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee: Employee | null
}

export function EmployeeViewDialog({ open, onOpenChange, employee }: EmployeeViewDialogProps) {
  if (!employee) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={employee.photo || ""} alt={employee.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {employee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{employee.name}</h3>
              <Badge variant="outline" className="font-mono">
                {employee.employeeId}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Father&apos;s Name</p>
              <p className="font-medium">{employee.fatherName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{format(new Date(employee.dateOfBirth), "dd MMM yyyy")}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Aadhaar Number</p>
              <p className="font-medium font-mono">{employee.aadhaarNumber.replace(/(\d{4})/g, "$1 ").trim()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Mobile Number</p>
              <p className="font-medium">{employee.mobileNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Emergency Contact</p>
              <p className="font-medium">{employee.emergencyContact}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date of Joining</p>
              <p className="font-medium">
                {employee.dateOfJoining ? format(new Date(employee.dateOfJoining), "dd MMM yyyy") : "-"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium">{employee.address}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
