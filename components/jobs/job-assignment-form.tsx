"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Employee, Product, ProductAssignment, ProductUnit, Customer } from "@/lib/types"
import { formatQuantityWithUnit } from "@/lib/types"
import type { Job } from "@/lib/types"
import { Plus, Trash2, AlertCircle, CheckCircle, Receipt, User } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface JobAssignmentFormProps {
  employees: Employee[]
  products: Product[]
  customers: Customer[]
  existingJobs: Job[]
  onSubmit: (
    billNumber: string,
    customerId: string,
    customerName: string,
    employeeId: string,
    employeeName: string,
    jobDate: string,
    productsAssigned: ProductAssignment[],
    amount: number,
    serviceType: string,
    nextServiceDate: string | undefined,
    remarks: string,
  ) => void
}

interface ProductAssignmentRow {
  id: string
  productId: string
  productName: string
  quantityGiven: number
  available: number
  unit: ProductUnit
}

export function JobAssignmentForm({ employees, products, customers, existingJobs, onSubmit }: JobAssignmentFormProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [jobDate, setJobDate] = useState(new Date().toISOString().split("T")[0])
  const [remarks, setRemarks] = useState("")
  const [amount, setAmount] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [nextServiceDate, setNextServiceDate] = useState("")

  const [assignments, setAssignments] = useState<ProductAssignmentRow[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [billNumber, setBillNumber] = useState("")
  const [billNumberError, setBillNumberError] = useState("")

  const selectedEmployee = employees.find((e) => e.employeeId === selectedEmployeeId)
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  const checkBillNumberDuplicate = (value: string): boolean => {
    return existingJobs.some((job) => job.billNumber.toLowerCase() === value.toLowerCase())
  }

  const handleConfirm = () => {
    if (!selectedEmployee || !selectedCustomer) return

    const productAssignments: ProductAssignmentRow[] = assignments.map((a) => ({
      ...a,
      quantityGiven: a.quantityGiven,
      unit: a.unit,
    }))

    onSubmit(
      billNumber.trim(),
      selectedCustomer.id,
      selectedCustomer.name,
      selectedEmployee.employeeId,
      selectedEmployee.name,
      jobDate,
      productAssignments,
      Number(amount) || 0,
      serviceType,
      nextServiceDate || undefined,
      remarks,
    )

    setSelectedEmployeeId("")
    setSelectedCustomerId("")
    setJobDate(new Date().toISOString().split("T")[0])
    setRemarks("")
    setAmount("")
    setServiceType("")
    setNextServiceDate("")
    setAssignments([])
    setConfirmOpen(false)
    setBillNumber("")
    setBillNumberError("")
  }

  const handleBillNumberChange = (value: string) => {
    setBillNumber(value)
    if (value && checkBillNumberDuplicate(value)) {
      setBillNumberError("This bill number already exists. Please enter a unique bill number.")
    } else {
      setBillNumberError("")
    }
  }

  const addProductRow = () => {
    setAssignments((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        productId: "",
        productName: "",
        quantityGiven: 0,
        available: 0,
        unit: "pieces",
      },
    ])
  }

  const removeProductRow = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id))
  }

  const updateProductSelection = (rowId: string, productId: string) => {
    const product = products.find((p) => p.productId === productId)
    if (!product) return

    const alreadyAssigned = assignments
      .filter((a) => a.id !== rowId && a.productId === productId)
      .reduce((sum, a) => sum + a.quantityGiven, 0)

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === rowId
          ? {
            ...a,
            productId,
            productName: product.productName,
            available: product.quantityAvailable - alreadyAssigned,
            quantityGiven: 0,
            unit: product.unit || "pieces",
          }
          : a,
      ),
    )
  }

  const updateQuantity = (rowId: string, quantity: number) => {
    setAssignments((prev) => prev.map((a) => (a.id === rowId ? { ...a, quantityGiven: Math.max(0, quantity) } : a)))
  }

  useEffect(() => {
    setAssignments((prev) => {
      const productTotals: Record<string, number> = {}
      prev.forEach((a) => {
        if (a.productId) {
          productTotals[a.productId] = (productTotals[a.productId] || 0) + a.quantityGiven
        }
      })

      return prev.map((a) => {
        if (!a.productId) return a
        const product = products.find((p) => p.productId === a.productId)
        if (!product) return a

        const othersTotal = productTotals[a.productId] - a.quantityGiven
        return {
          ...a,
          available: product.quantityAvailable - othersTotal,
        }
      })
    })
  }, [products])

  const getAvailableProducts = (currentRowId: string) => {
    const usedProductIds = assignments.filter((a) => a.id !== currentRowId && a.productId).map((a) => a.productId)

    return products.filter((p) => !usedProductIds.includes(p.productId) && p.quantityAvailable > 0)
  }

  const validateForm = (): string | null => {
    if (!billNumber.trim()) return "Please enter a bill number"
    if (checkBillNumberDuplicate(billNumber))
      return "This bill number already exists. Please enter a unique bill number."
    if (!selectedCustomerId) return "Please select a customer"
    if (!selectedEmployeeId) return "Please select an employee"
    if (!jobDate) return "Please select a job date"
    if (assignments.length === 0) return "Please add at least one product"

    for (const a of assignments) {
      if (!a.productId) return "Please select a product for all rows"
      if (a.quantityGiven <= 0) return "Quantity must be greater than 0"
      if (a.quantityGiven > a.available) return `Insufficient stock for ${a.productName}`
    }

    return null
  }

  const handleSubmitClick = () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }
    setConfirmOpen(true)
  }


  const totalItems = assignments.reduce((sum, a) => sum + a.quantityGiven, 0)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New Job Assignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="billNumber">Bill Number *</Label>
            <div className="relative">
              <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="billNumber"
                value={billNumber}
                onChange={(e) => handleBillNumberChange(e.target.value)}
                placeholder="Enter unique bill number"
                className={cn("pl-10", billNumberError && "border-destructive")}
              />
            </div>
            {billNumberError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {billNumberError}
              </p>
            )}
          </div>

          {/* Customer & Employee Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Customer *</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((cust) => (
                    <SelectItem key={cust.id} value={cust.id}>
                      {cust.name} ({cust.contactNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Employee *</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
                      {emp.name} ({emp.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Job Date *</Label>
              <Input type="date" value={jobDate} onChange={(e) => setJobDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Bill Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                placeholder="Enter bill amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type</Label>
              <Input
                id="serviceType"
                placeholder="e.g. Termite Control, General Pest"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextServiceDate">Next Service Due</Label>
              <Input
                id="nextServiceDate"
                type="date"
                value={nextServiceDate}
                onChange={(e) => setNextServiceDate(e.target.value)}
              />
            </div>
          </div>

          {/* Product Assignments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Products to Assign *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addProductRow}>
                <Plus className="h-4 w-4 mr-1" /> Add Product
              </Button>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                Click &quot;Add Product&quot; to assign products to this job
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => {
                  const availableProducts = getAvailableProducts(assignment.id)
                  const isOverLimit = assignment.quantityGiven > assignment.available
                  const remaining = assignment.available - assignment.quantityGiven

                  return (
                    <div key={assignment.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Product</Label>
                          <Select
                            value={assignment.productId}
                            onValueChange={(v) => updateProductSelection(assignment.id, v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {assignment.productId && (
                                <SelectItem value={assignment.productId}>{assignment.productName}</SelectItem>
                              )}
                              {availableProducts.map((prod) => (
                                <SelectItem key={prod.productId} value={prod.productId}>
                                  {prod.productName} (
                                  {formatQuantityWithUnit(prod.quantityAvailable, prod.unit || "pieces")})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">Quantity ({assignment.unit})</Label>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            max={assignment.available}
                            value={assignment.quantityGiven || ""}
                            onChange={(e) => updateQuantity(assignment.id, Number.parseFloat(e.target.value) || 0)}
                            className={cn(isOverLimit && "border-destructive")}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs">After Assignment</Label>
                          <div
                            className={cn(
                              "h-9 flex items-center px-3 rounded-md text-sm font-medium",
                              isOverLimit ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
                            )}
                          >
                            {assignment.productId ? (
                              <>
                                {isOverLimit ? (
                                  <AlertCircle className="h-4 w-4 mr-2" />
                                ) : remaining >= 0 ? (
                                  <CheckCircle className="h-4 w-4 mr-2 text-[#7CB342]" />
                                ) : null}
                                {formatQuantityWithUnit(remaining, assignment.unit)} remaining
                              </>
                            ) : (
                              "-"
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeProductRow(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Any additional notes for this job..."
              rows={2}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {assignments.length > 0 && (
                <span>
                  Total: {totalItems} items from {assignments.filter((a) => a.productId).length} products
                </span>
              )}
            </div>
            <Button onClick={handleSubmitClick} disabled={assignments.length === 0}>
              Assign Job
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#7CB342]">
              <CheckCircle className="h-5 w-5" />
              Confirm Job Assignment
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-lg font-semibold text-primary flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Bill Number: {billNumber}
              </p>
              <p>
                <strong>Employee:</strong> {selectedEmployee?.name} ({selectedEmployeeId})
              </p>
              <p>
                <strong>Job Date:</strong> {jobDate}
              </p>
              <p>
                <strong>Products:</strong>
              </p>
              <ul className="list-disc list-inside text-sm pl-2">
                {assignments.map((a) => (
                  <li key={a.id}>
                    {a.productName}: {formatQuantityWithUnit(a.quantityGiven, a.unit)}
                  </li>
                ))}
              </ul>
              {remarks && (
                <p>
                  <strong>Remarks:</strong> {remarks}
                </p>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              This will deduct the assigned quantities from stock. Continue?
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
