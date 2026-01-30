export interface Employee {
  id: string
  employeeId: string
  name: string
  fatherName: string
  aadhaarNumber: string
  dateOfBirth: string
  mobileNumber: string
  emergencyContact: string
  address: string
  photo: string | null
  dateOfJoining: string
  password?: string
  stockInHand?: ProductAssignment[] // Tracking current stock with employee
  createdAt: string
  updatedAt: string
}

export type ProductUnit = "litres" | "ml" | "kg" | "mg" | "pieces"

export interface Product {
  id: string
  productId: string
  productName: string
  dateOfPurchase: string
  quantityPurchased: number
  quantityAvailable: number
  unit: ProductUnit
  supplierName: string
  remarks: string
  createdAt: string
  updatedAt: string
}

export interface ProductAssignment {
  productId: string
  productName: string
  quantityGiven: number
  unit: ProductUnit
}

export interface Customer {
  id: string
  name: string
  address: string
  contactNumber: string
  email?: string
  serviceType?: string
  contractStartDate?: string
  contractEndDate?: string
  contractAmount?: number
  frequency?: string // e.g., Monthly
  serviceDates?: string[] // Max 10 dates
  createdAt: string
  updatedAt: string
}

export interface Job {
  id: string
  billNumber: string
  customerId: string // Linked to Customer
  customerName: string // Denormalized for display/history
  employeeId: string
  employeeName: string
  jobDate: string
  productsAssigned: ProductAssignment[]
  productsUsed?: ProductAssignment[] // Actual usage
  amount?: number // Bill Amount
  serviceType?: string // e.g. Termite Control
  nextServiceDate?: string // ISO Date
  status: "pending" | "completed"
  remarks: string
  createdAt: string
}

export interface StockReturnRequest {
  id: string
  jobId?: string
  billNumber?: string
  employeeId: string
  employeeName: string
  productsReturned: ProductAssignment[]
  status: "pending" | "approved" | "rejected"
  requestedAt: string
  resolvedAt?: string
}

export interface Activity {
  id: string
  type:
  | "employee_added"
  | "employee_updated"
  | "employee_deleted"
  | "product_added"
  | "product_updated"
  | "product_deleted"
  | "customer_added"
  | "customer_updated"
  | "customer_deleted"
  | "job_assigned"
  | "job_completed"
  | "stock_return_requested"
  | "stock_return_approved"
  | "stock_return_rejected"
  | "stock_restocked"
  description: string
  timestamp: string
}

export interface AppData {
  employees: Employee[]
  products: Product[]
  customers: Customer[]
  jobs: Job[]
  activities: Activity[]
  stockReturnRequests: StockReturnRequest[]
}

export const LOW_STOCK_THRESHOLD = 10

export function formatQuantityWithUnit(quantity: number, unit: ProductUnit): string {
  return `${quantity} ${unit}`
}
