import * as XLSX from "xlsx"
import type { Product, Job, Customer } from "./types"

export function exportCustomersToExcel(customers: Customer[]): void {
  const data = customers.map((customer) => {
    // @ts-ignore - Handle potential Prisma structure vs legacy type
    const contract = customer.contracts && customer.contracts.length > 0 ? customer.contracts[0] : {};

    // Format service dates if available
    const serviceDates = contract.visits
      ? contract.visits.map((v: any) => v.scheduledDate ? new Date(v.scheduledDate).toLocaleDateString() : v.date).join(", ")
      : (customer.serviceDates || []).join(", ");

    return {
      "Name": customer.name,
      "Contact Number": customer.contactNumber,
      "Address": customer.address,
      "Email": customer.email || "-",
      "Service Type": contract.serviceType || customer.serviceType || "-",
      "Contract Start": contract.startDate ? new Date(contract.startDate).toLocaleDateString() : (contract.contractStartDate || "-"),
      "Contract End": contract.endDate ? new Date(contract.endDate).toLocaleDateString() : (contract.contractEndDate || "-"),
      "Terms": contract.terms || "-",
      "Frequency": contract.frequency || "-",
      "Value": contract.contractValue || contract.contractAmount || 0,
      "GST": contract.gst || 0,
      "Total Amount": contract.totalAmount || 0,
      "Service Dates": serviceDates || "-",
      "Created At": new Date(customer.createdAt).toLocaleDateString(),
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Customers")

  // Auto-size columns
  const colWidths = [
    { wch: 20 }, // Name
    { wch: 15 }, // Contact
    { wch: 30 }, // Address
    { wch: 25 }, // Email
    { wch: 25 }, // Service Type
    { wch: 15 }, // Start
    { wch: 15 }, // End
    { wch: 15 }, // Terms
    { wch: 20 }, // Frequency
    { wch: 10 }, // Value
    { wch: 10 }, // GST
    { wch: 12 }, // Total
    { wch: 40 }, // Service Dates
    { wch: 15 }, // Created At
  ]
  worksheet["!cols"] = colWidths

  XLSX.writeFile(workbook, `Customers_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export function importCustomersFromExcel(file: File): Promise<Omit<Customer, "id" | "createdAt" | "updatedAt">[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

        const customers = jsonData.map((row) => ({
          name: row["Name"] || "",
          address: row["Address"] || "",
          contactNumber: row["Contact Number"] || "",
          email: row["Email"] || undefined,
        }))

        resolve(customers)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = (error) => reject(error)
    reader.readAsBinaryString(file)
  })
}

export function exportStockToExcel(products: Product[], jobs: Job[]): void {
  // Calculate total assigned for each product
  const productAssignments: Record<string, number> = {}

  jobs.forEach((job) => {
    job.productsAssigned.forEach((assignment) => {
      productAssignments[assignment.productId] =
        (productAssignments[assignment.productId] || 0) + assignment.quantityGiven
    })
  })

  const data = products.map((product) => ({
    "Product ID": product.productId,
    "Product Name": product.productName,
    "Date of Purchase": new Date(product.dateOfPurchase).toLocaleDateString(),
    "Quantity Purchased": product.quantityPurchased,
    "Quantity Assigned": productAssignments[product.productId] || 0,
    "Quantity Available": product.quantityAvailable,
    "Supplier Name": product.supplierName || "-",
    Remarks: product.remarks || "-",
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Report")

  // Auto-size columns
  const colWidths = [
    { wch: 12 }, // Product ID
    { wch: 25 }, // Product Name
    { wch: 15 }, // Date of Purchase
    { wch: 18 }, // Quantity Purchased
    { wch: 16 }, // Quantity Assigned
    { wch: 18 }, // Quantity Available
    { wch: 20 }, // Supplier Name
    { wch: 30 }, // Remarks
  ]
  worksheet["!cols"] = colWidths

  XLSX.writeFile(workbook, `Stock_Report_${new Date().toISOString().split("T")[0]}.xlsx`)
}

export function exportReportsToExcel(jobs: Job[], customers: Customer[]): void {
  const data = jobs.map((job) => {
    const customer = customers.find((c) => c.id === job.customerId)
    const stockUsed = (job.productsUsed || [])
      .map((p) => `${p.productName}: ${p.quantityGiven} ${p.unit}`)
      .join(", ")

    return {
      Date: new Date(job.jobDate).toLocaleDateString(),
      "Customer Name": job.customerName,
      Address: customer?.address || "-",
      "Contact Number": customer?.contactNumber || "-",
      "Service Type": job.serviceType || "Standard Service",
      Employee: job.employeeName,
      "Bill Amount": job.amount || 0,
      "Stock Used": stockUsed || "None",
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Service Reports")

  // Auto-size columns
  const colWidths = [
    { wch: 12 }, // Date
    { wch: 20 }, // Customer Name
    { wch: 30 }, // Address
    { wch: 15 }, // Contact
    { wch: 20 }, // Service Type
    { wch: 20 }, // Employee
    { wch: 12 }, // Bill Amount
    { wch: 40 }, // Stock Used
  ]
  worksheet["!cols"] = colWidths

  XLSX.writeFile(workbook, `Service_Report_${new Date().toISOString().split("T")[0]}.xlsx`)
}
