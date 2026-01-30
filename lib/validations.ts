export const validateAadhaar = (aadhaar: string): boolean => {
  return /^\d{12}$/.test(aadhaar)
}

export const validateMobile = (mobile: string): boolean => {
  return /^\d{10}$/.test(mobile)
}

export const validateEmployeeId = (id: string, existingIds: string[], currentId?: string): boolean => {
  if (!id.trim()) return false
  const isDuplicate = existingIds.some((existingId) => existingId === id && existingId !== currentId)
  return !isDuplicate
}

export const validateImageFile = (file: File): boolean => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png"]
  return validTypes.includes(file.type)
}

export const formatAadhaar = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 12)
  return digits
}

export const formatMobile = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 10)
  return digits
}
