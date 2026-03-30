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
import { Plus, Trash2, AlertCircle, CheckCircle, Receipt, User, Check, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface JobAssignmentFormProps {
  employees: Employee[]
  products: Product[]
  customers: Customer[]
  existingJobs: Job[]
  preselectedCustomerId?: string
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

export function JobAssignmentForm({ employees, products, customers, existingJobs, preselectedCustomerId, onSubmit }: JobAssignmentFormProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [jobDate, setJobDate] = useState(new Date().toISOString().split("T")[0])
  const [remarks, setRemarks] = useState("")
  const [amount, setAmount] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [customerServices, setCustomerServices] = useState<string[]>([]) // All services of selected customer
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set()) // Checked services
  const [nextServiceDate, setNextServiceDate] = useState("")
  const [frequency, setFrequency] = useState("")

  const [assignments, setAssignments] = useState<ProductAssignmentRow[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [openCustomerSearch, setOpenCustomerSearch] = useState(false)
  const [billNumber, setBillNumber] = useState("")
  const [billNumberError, setBillNumberError] = useState("")

  const selectedEmployee = employees.find((e) => e.employeeId === selectedEmployeeId)
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId)

  // Auto-select customer if navigated from customers page
  useEffect(() => {
    if (preselectedCustomerId && customers.length > 0 && !selectedCustomerId) {
      const customer = customers.find(c => c.id === preselectedCustomerId)
      if (customer) {
        setSelectedCustomerId(customer.id)
      }
    }
  }, [preselectedCustomerId, customers])

  useEffect(() => {
    if (selectedCustomer) {
      const contract = selectedCustomer.contracts && selectedCustomer.contracts.length > 0
        ? selectedCustomer.contracts[0]
        : null

      const rawServiceType = contract?.serviceType || selectedCustomer.serviceType || ""
      // Split into individual services so checkboxes can show all options
      const services = rawServiceType
        ? rawServiceType.split(',').map((s: string) => s.trim()).filter(Boolean)
        : []
      setCustomerServices(services)
      // Pre-select ALL services (they are done together)
      const allSelected = new Set<string>(services)
      setSelectedServices(allSelected)
      setServiceType(services.join(', '))

      setFrequency(contract?.frequency || selectedCustomer.frequency || "")

      // Suggest next service date from next pending visit
      const nextVisit = contract?.visits?.find((v: any) => v.status === "PENDING")
      if (nextVisit?.scheduledDate) {
        setNextServiceDate(new Date(nextVisit.scheduledDate).toISOString().split("T")[0])
      } else if (selectedCustomer.serviceDates && selectedCustomer.serviceDates.length > 0) {
        setNextServiceDate(selectedCustomer.serviceDates[0])
      }
    } else {
      setCustomerServices([])
      setSelectedServices(new Set())
      setServiceType("")
      setFrequency("")
      setNextServiceDate("")
    }
  }, [selectedCustomerId, customers])

  const checkBillNumberDuplicate = (value: string): boolean => {
    return existingJobs.some((job) => job.billNumber?.toLowerCase() === value.toLowerCase())
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
    setCustomerServices([])
    setSelectedServices(new Set())
    setFrequency("")
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
    // Products are now optional
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
              <Popover open={openCustomerSearch} onOpenChange={setOpenCustomerSearch}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCustomerSearch}
                    className="w-full justify-between font-normal"
                  >
                    {selectedCustomerId
                      ? customers.find((c) => c.id === selectedCustomerId)?.name
                      : "Search customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search customer name or mobile..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((cust) => (
                          <CommandItem
                            key={cust.id}
                            value={`${cust.name} ${cust.contactNumber}`}
                            onSelect={() => {
                              setSelectedCustomerId(cust.id)
                              setOpenCustomerSearch(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCustomerId === cust.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{cust.name}</span>
                              <span className="text-xs text-muted-foreground">{cust.contactNumber}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Select Employee *</Label>
              <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.isActive).map((emp) => (
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
              <Label>
                Service Type
                {customerServices.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    (select all that apply for this visit)
                  </span>
                )}
              </Label>
              {customerServices.length > 0 ? (
                // Show checkboxes for all purchased services
                <div className="rounded-md border p-3 space-y-2">
                  {customerServices.map((s) => {
                    const checked = selectedServices.has(s)
                    return (
                      <label
                        key={s}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setSelectedServices(prev => {
                              const next = new Set(prev)
                              if (next.has(s)) next.delete(s)
                              else next.add(s)
                              // Keep order consistent with original list
                              const ordered = customerServices.filter(svc => next.has(svc))
                              setServiceType(ordered.join(', '))
                              return next
                            })
                          }}
                          className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                        />
                        <span className={cn(
                          "text-sm transition-colors",
                          checked ? "text-foreground font-medium" : "text-muted-foreground"
                        )}>
                          {s}
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : (
                // No customer selected or no services on record — free text
                <Input
                  id="serviceType"
                  placeholder="e.g. Termite Control, General Pest"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Contract Frequency</Label>
              <Input
                id="frequency"
                placeholder="Showing from contract..."
                value={frequency}
                readOnly
                className="bg-muted"
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
            <Button onClick={handleSubmitClick}>
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
              {assignments.length > 0 ? (
                <ul className="list-disc list-inside text-sm pl-2">
                  {assignments.map((a) => (
                    <li key={a.id}>
                      {a.productName}: {formatQuantityWithUnit(a.quantityGiven, a.unit)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground pl-2 italic">No products assigned</p>
              )}
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
