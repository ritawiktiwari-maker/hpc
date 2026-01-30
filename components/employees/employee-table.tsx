"use client"

import type { Employee } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"

interface EmployeeTableProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
  onView: (employee: Employee) => void
}

export function EmployeeTable({ employees, onEdit, onDelete, onView }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No employees found. Add your first employee to get started.
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12"></TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Mobile</TableHead>
            <TableHead className="hidden lg:table-cell">Aadhaar</TableHead>
            <TableHead className="hidden lg:table-cell">Joined</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <Avatar className="h-9 w-9">
                  <AvatarImage src={employee.photo || ""} alt={employee.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {employee.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell className="font-mono text-sm">{employee.employeeId}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-xs text-muted-foreground md:hidden">{employee.mobileNumber}</p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{employee.mobileNumber}</TableCell>
              <TableCell className="hidden lg:table-cell font-mono text-sm">
                {employee.aadhaarNumber.replace(/(\d{4})/g, "$1 ").trim()}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {employee.dateOfJoining ? format(new Date(employee.dateOfJoining), "dd MMM yyyy") : "-"}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(employee)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(employee)}>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(employee)} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
