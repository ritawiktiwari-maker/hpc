"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ShieldCheck, User } from "lucide-react"
import { toast } from "sonner"
import { getData, validateEmployeeCredentials } from "@/lib/data-store"
import { employeeLogin } from "@/lib/auth"

export default function EmployeeLoginPage() {
    const router = useRouter()
    const [employeeId, setEmployeeId] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = getData()
            const employee = validateEmployeeCredentials(data, employeeId.toUpperCase(), password)

            if (employee) {
                employeeLogin(employee.employeeId)
                toast.success(`Welcome back, ${employee.name}`)
                router.push("/employee/dashboard")
            } else {
                toast.error("Invalid Employee ID or Password")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred during login")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
                        <User className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary">Employee Portal</CardTitle>
                    <CardDescription>Login to view jobs and manage stock</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="employeeId">Employee ID</Label>
                            <Input
                                id="employeeId"
                                placeholder="EMP0001"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <Button variant="link" className="text-muted-foreground" onClick={() => router.push("/")}>
                            Back to Admin Panel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
