import type { AppData, Employee, Product, Job, Activity, ProductAssignment, Customer, StockReturnRequest } from "./types"

const STORAGE_KEY = "pestcontrol_admin_data"

const defaultData: AppData = {
  employees: [],
  products: [],
  customers: [],
  jobs: [],
  activities: [],
  stockReturnRequests: [],
}

export function getData(): AppData {
  if (typeof window === "undefined") return defaultData

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return defaultData

  try {
    const parsed = JSON.parse(stored)
    return { ...defaultData, ...parsed }
  } catch {
    return defaultData
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function generateEmployeeId(employees: Employee[]): string {
  const maxNum = employees.reduce((max, emp) => {
    const num = Number.parseInt(emp.employeeId.replace("EMP", ""), 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 0)
  return `EMP${String(maxNum + 1).padStart(4, "0")}`
}

export function generateProductId(products: Product[]): string {
  const maxNum = products.reduce((max, prod) => {
    const num = Number.parseInt(prod.productId.replace("PRD", ""), 10)
    return isNaN(num) ? max : Math.max(max, num)
  }, 0)
  return `PRD${String(maxNum + 1).padStart(4, "0")}`
}

export function isBillNumberDuplicate(jobs: Job[], billNumber: string): boolean {
  return jobs.some((job) => job.billNumber.toLowerCase() === billNumber.toLowerCase())
}

export function addActivity(data: AppData, type: Activity["type"], description: string): AppData {
  const activity: Activity = {
    id: generateId(),
    type,
    description,
    timestamp: new Date().toISOString(),
  }
  return {
    ...data,
    activities: [activity, ...data.activities].slice(0, 50), // Keep last 50 activities
  }
}

// Employee operations
export function addEmployee(data: AppData, employee: Omit<Employee, "id" | "createdAt" | "updatedAt">): AppData {
  const newEmployee: Employee = {
    ...employee,
    id: generateId(),
    // Password should ideally be hashed, but for simple JSON store we keep as is for now
    password: employee.password || "123456", // Default password if not provided
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updated = {
    ...data,
    employees: [...data.employees, newEmployee],
  }
  return addActivity(updated, "employee_added", `Employee ${employee.name} (${employee.employeeId}) added`)
}

export function validateEmployeeCredentials(data: AppData, employeeId: string, password: string): Employee | null {
  const employee = data.employees.find((e) => e.employeeId === employeeId && e.password === password)
  return employee || null
}

export function updateEmployee(data: AppData, id: string, updates: Partial<Employee>): AppData {
  const updated = {
    ...data,
    employees: data.employees.map((emp) =>
      emp.id === id ? { ...emp, ...updates, updatedAt: new Date().toISOString() } : emp,
    ),
  }
  const employee = updated.employees.find((e) => e.id === id)
  return addActivity(updated, "employee_updated", `Employee ${employee?.name} (${employee?.employeeId}) updated`)
}

export function deleteEmployee(data: AppData, id: string): AppData {
  const employee = data.employees.find((e) => e.id === id)
  const updated = {
    ...data,
    employees: data.employees.filter((emp) => emp.id !== id),
  }
  return addActivity(updated, "employee_deleted", `Employee ${employee?.name} (${employee?.employeeId}) deleted`)
}

// Product operations
export function addProduct(
  data: AppData,
  product: Omit<Product, "id" | "createdAt" | "updatedAt" | "quantityAvailable">,
): AppData {
  const newProduct: Product = {
    ...product,
    id: generateId(),
    quantityAvailable: product.quantityPurchased,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updated = {
    ...data,
    products: [...data.products, newProduct],
  }
  return addActivity(
    updated,
    "product_added",
    `Product ${product.productName} (${product.productId}) added with ${product.quantityPurchased} ${product.unit}`,
  )
}

export function updateProduct(data: AppData, id: string, updates: Partial<Product>): AppData {
  const updated = {
    ...data,
    products: data.products.map((prod) =>
      prod.id === id ? { ...prod, ...updates, updatedAt: new Date().toISOString() } : prod,
    ),
  }
  const product = updated.products.find((p) => p.id === id)
  return addActivity(updated, "product_updated", `Product ${product?.productName} (${product?.productId}) updated`)
}

export function deleteProduct(data: AppData, id: string): AppData {
  const product = data.products.find((p) => p.id === id)
  const updated = {
    ...data,
    products: data.products.filter((prod) => prod.id !== id),
  }
  return addActivity(updated, "product_deleted", `Product ${product?.productName} (${product?.productId}) deleted`)
}

export function restockProduct(data: AppData, id: string, quantityAdded: number): AppData {
  const product = data.products.find((p) => p.id === id)
  if (!product) return data

  const newQuantityAvailable = product.quantityAvailable + quantityAdded
  const newQuantityPurchased = product.quantityPurchased + quantityAdded

  const updated = {
    ...data,
    products: data.products.map((prod) =>
      prod.id === id
        ? {
          ...prod,
          quantityAvailable: newQuantityAvailable,
          quantityPurchased: newQuantityPurchased,
          updatedAt: new Date().toISOString(),
        }
        : prod,
    ),
  }
  return addActivity(
    updated,
    "stock_restocked",
    `Restocked ${product.productName} (+${quantityAdded} ${product.unit}). New Balance: ${newQuantityAvailable} ${product.unit}`,
  )
}

// Job operations
// Customer operations
export function addCustomer(data: AppData, customer: Omit<Customer, "id" | "createdAt" | "updatedAt">): AppData {
  const newCustomer: Customer = {
    ...customer,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  const updated = {
    ...data,
    customers: [...data.customers, newCustomer],
  }
  return addActivity(updated, "customer_added", `Customer ${customer.name} added`)
}

export function updateCustomer(data: AppData, id: string, updates: Partial<Customer>): AppData {
  const updated = {
    ...data,
    customers: data.customers.map((cust) =>
      cust.id === id ? { ...cust, ...updates, updatedAt: new Date().toISOString() } : cust,
    ),
  }
  const customer = updated.customers.find((c) => c.id === id)
  return addActivity(updated, "customer_updated", `Customer ${customer?.name} updated`)
}

export function deleteCustomer(data: AppData, id: string): AppData {
  const customer = data.customers.find((c) => c.id === id)
  const updated = {
    ...data,
    customers: data.customers.filter((c) => c.id !== id),
  }
  return addActivity(updated, "customer_deleted", `Customer ${customer?.name} deleted`)
}

// Job operations
export function assignJob(
  data: AppData,
  billNumber: string,
  customerId: string,
  customerName: string,
  employeeId: string,
  employeeName: string,
  jobDate: string,
  productsAssigned: ProductAssignment[],
  amount: number,
  serviceType: string,
  nextServiceDate: string | undefined, // Optional
  remarks: string,
): AppData {
  const newJob: Job = {
    id: generateId(),
    billNumber,
    customerId,
    customerName,
    employeeId,
    employeeName,
    jobDate,
    productsAssigned,
    amount,
    serviceType,
    nextServiceDate,
    status: "pending",
    remarks,
    createdAt: new Date().toISOString(),
  }


  // Deduct stock from Warehouse (Global)
  const updatedProducts = data.products.map((product) => {
    const assignment = productsAssigned.find((a) => a.productId === product.productId)
    if (assignment) {
      return {
        ...product,
        quantityAvailable: product.quantityAvailable - assignment.quantityGiven,
        updatedAt: new Date().toISOString(),
      }
    }
    return product
  })

  // Add stock to Employee's stockInHand
  const updatedEmployees = data.employees.map((emp) => {
    if (emp.employeeId === employeeId) {
      const currentStock = emp.stockInHand || []
      const updatedStock = [...currentStock]

      productsAssigned.forEach(newStock => {
        const existingIndex = updatedStock.findIndex(s => s.productId === newStock.productId)
        if (existingIndex >= 0) {
          updatedStock[existingIndex] = {
            ...updatedStock[existingIndex],
            quantityGiven: updatedStock[existingIndex].quantityGiven + newStock.quantityGiven
          }
        } else {
          updatedStock.push(newStock)
        }
      })

      return {
        ...emp,
        stockInHand: updatedStock,
        updatedAt: new Date().toISOString()
      }
    }
    return emp
  })

  const updated = {
    ...data,
    jobs: [newJob, ...data.jobs],
    products: updatedProducts,
    employees: updatedEmployees,
  }

  return addActivity(
    updated,
    "job_assigned",
    `Job ${billNumber} assigned to ${employeeName} for customer ${customerName}`,
  )
}

export function completeJob(data: AppData, jobId: string, productsUsed: ProductAssignment[]): AppData {
  const job = data.jobs.find((j) => j.id === jobId)
  if (!job || job.status === "completed") return data

  // Calculate return items
  const productsReturned: ProductAssignment[] = []

  // Calculate difference but DO NOT return stock yet
  job.productsAssigned.forEach((assigned) => {
    const used = productsUsed.find((p) => p.productId === assigned.productId)
    if (used) {
      const returnedAmount = Math.max(0, assigned.quantityGiven - used.quantityGiven)
      if (returnedAmount > 0) {
        productsReturned.push({
          productId: assigned.productId,
          productName: assigned.productName,
          quantityGiven: returnedAmount,
          unit: assigned.unit,
        })
      }
    } else {
      // If product was assigned but not in used list (assumed 0 used?), return all
      // Or strictly follow existing logic where only matched items are processed?
      // Assuming used list contains all relevant items. 
      // If an item is missing from 'productsUsed', it implies 0 used? 
      // Let's assume input 'productsUsed' is complete.
      // If an assigned item is missing from used, we should probably consider it 0 used.
      // However, looking at previous logic: "if (assigned && used)". 
      // It ignored missing items. Sticking to safer logic for now to avoid regressions.
    }
  })


  // Deduct used stock from Employee's stockInHand
  const updatedEmployees = data.employees.map((emp) => {
    if (emp.employeeId === job.employeeId && emp.stockInHand) {
      const updatedStock = emp.stockInHand.map(inHand => {
        const used = productsUsed.find(u => u.productId === inHand.productId)
        if (used) {
          return {
            ...inHand,
            quantityGiven: Math.max(0, inHand.quantityGiven - used.quantityGiven)
          }
        }
        return inHand
      }).filter(p => p.quantityGiven > 0) // Remove items with 0 quantity

      return { ...emp, stockInHand: updatedStock, updatedAt: new Date().toISOString() }
    }
    return emp
  })

  // Create Stock Return Request if needed (for unused portion from THIS job)
  // MODIFIED: Auto-return disabled. Employee must manually request return.
  let activityType: Activity["type"] = "job_completed"
  let activityDesc = `Job ${job.billNumber} completed by ${job.employeeName}`

  /* 
  // Previous Logic: Auto-create request
  if (productsReturned.length > 0) {
    ...
  }
  */

  const updatedJobs = data.jobs.map((j) =>
    j.id === jobId
      ? { ...j, status: "completed" as const, productsUsed, updatedAt: new Date().toISOString() }
      : j,
  )

  const updated = {
    ...data,
    jobs: updatedJobs,
    // stockReturnRequests: updatedRequests, // No longer updating requests here
  }

  return addActivity(updated, activityType, activityDesc)
}

export function createStockReturnRequest(data: AppData, employeeId: string, productsReturned: ProductAssignment[]): AppData {
  const employee = data.employees.find(e => e.employeeId === employeeId)
  if (!employee) return data

  const newRequest: StockReturnRequest = {
    id: generateId(),
    // No jobId or billNumber for manual returns
    employeeId: employee.employeeId,
    employeeName: employee.name,
    productsReturned,
    status: "pending",
    requestedAt: new Date().toISOString(),
  }

  const updated = {
    ...data,
    stockReturnRequests: [...data.stockReturnRequests, newRequest]
  }

  return addActivity(updated, "stock_return_requested", `Manual stock return requested by ${employee.name}`)
}

export function approveStockReturn(data: AppData, requestId: string): AppData {
  const request = data.stockReturnRequests.find(r => r.id === requestId)
  if (!request || request.status !== "pending") return data


  // Return stock to Warehouse
  const updatedProducts = data.products.map((product) => {
    const returned = request.productsReturned.find((r) => r.productId === product.productId)
    if (returned) {
      return {
        ...product,
        quantityAvailable: product.quantityAvailable + returned.quantityGiven,
        updatedAt: new Date().toISOString(),
      }
    }
    return product
  })

  // Deduct from Employee's stockInHand (as it is now returned to warehouse)
  const updatedEmployees = data.employees.map(emp => {
    if (emp.employeeId === request.employeeId && emp.stockInHand) {
      const updatedStock = emp.stockInHand.map(inHand => {
        const returned = request.productsReturned.find(r => r.productId === inHand.productId)
        if (returned) {
          return {
            ...inHand,
            quantityGiven: Math.max(0, inHand.quantityGiven - returned.quantityGiven)
          }
        }
        return inHand
      }).filter(p => p.quantityGiven > 0)

      return { ...emp, stockInHand: updatedStock, updatedAt: new Date().toISOString() }
    }
    return emp
  })

  const updatedRequests = data.stockReturnRequests.map((r) =>
    r.id === requestId
      ? { ...r, status: "approved" as const, resolvedAt: new Date().toISOString() }
      : r,
  )

  const updated = {
    ...data,
    products: updatedProducts,
    employees: updatedEmployees,
    stockReturnRequests: updatedRequests,
  }

  const activityDesc = request.billNumber
    ? `Stock return approved for Job ${request.billNumber} (${request.employeeName})`
    : `Manual stock return approved for ${request.employeeName}`

  return addActivity(
    updated,
    "stock_return_approved",
    activityDesc,
  )
}

export function rejectStockReturn(data: AppData, requestId: string): AppData {
  const request = data.stockReturnRequests.find(r => r.id === requestId)
  if (!request || request.status !== "pending") return data

  const updatedRequests = data.stockReturnRequests.map(r =>
    r.id === requestId
      ? { ...r, status: "rejected" as const, resolvedAt: new Date().toISOString() }
      : r
  )

  const updated = {
    ...data,
    stockReturnRequests: updatedRequests
  }

  const activityDesc = request.billNumber
    ? `Stock return rejected for Job ${request.billNumber} (${request.employeeName})`
    : `Manual stock return rejected for ${request.employeeName}`

  return addActivity(updated, "stock_return_rejected", activityDesc)
}
