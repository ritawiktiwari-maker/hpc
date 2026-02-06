
import { prisma } from '../lib/db'

async function main() {
    console.log('--- LEADS ---')
    const leads = await prisma.lead.findMany({
        include: { convertedCustomer: true }
    })
    console.log(JSON.stringify(leads, null, 2))

    console.log('--- CUSTOMERS ---')
    const customers = await prisma.customer.findMany()
    console.log(JSON.stringify(customers, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
