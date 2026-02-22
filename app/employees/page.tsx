"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { LoginScreen } from "@/components/login-screen"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmployeeTable } from "@/components/employees/employee-table"
import { EmployeeFormDialog } from "@/components/employees/employee-form-dialog"
import { EmployeeViewDialog } from "@/components/employees/employee-view-dialog"
import type { AppData, Employee } from "@/lib/types"
import { getData, saveData, addEmployee, updateEmployee, deleteEmployee } from "@/lib/data-store"
import { Plus, Search, Users } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function EmployeesPage() {
  const { isLoggedIn } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const data = await res.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchData()
    }
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()),
  )

  const handleAdd = () => {
    setSelectedEmployee(null)
    setFormOpen(true)
  }

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee)
    setFormOpen(true)
  }

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setViewOpen(true)
  }

  const handleDeleteClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setDeleteOpen(true)
  }

  const handleFormSubmit = async (employeeData: any) => {
    try {
      if (selectedEmployee) {
        const res = await fetch(`/api/employees/${selectedEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        })
        if (!res.ok) throw new Error("Update failed")
        toast.success("Employee updated successfully")
      } else {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        })
        if (!res.ok) throw new Error("Create failed")
        toast.success("Employee added successfully")
      }
      fetchData()
      setFormOpen(false)
    } catch (e) {
      toast.error("Operation failed")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return
    try {
      const res = await fetch(`/api/employees/${selectedEmployee.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error("Delete failed")
      toast.success("Employee deleted successfully")
      fetchData()
      setDeleteOpen(false)
      setSelectedEmployee(null)
    } catch (e) {
      toast.error("Failed to delete employee")
    }
  }

  const handleToggleStatus = async (employee: Employee) => {
    try {
      const res = await fetch(`/api/employees/${employee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !employee.isActive })
      })
      if (!res.ok) throw new Error("Status update failed")

      setEmployees(prev => prev.map(e =>
        e.id === employee.id ? { ...e, isActive: !e.isActive } : e
      ))

      toast.success(`Employee ${!employee.isActive ? 'activated' : 'deactivated'}`)
    } catch (e) {
      toast.error("Failed to update status")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse text-muted-foreground">Loading Employees...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">Manage your pest control team</p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Employee
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Employees ({employees.length})
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <EmployeeTable
              employees={filteredEmployees}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onView={handleView}
              onToggleStatus={handleToggleStatus}
            />
          </CardContent>
        </Card>
      </div>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        employee={selectedEmployee}
        existingEmployees={employees}
        onSubmit={handleFormSubmit}
      />

      <EmployeeViewDialog open={viewOpen} onOpenChange={setViewOpen} employee={selectedEmployee} />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedEmployee?.name} ({selectedEmployee?.employeeId})? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
