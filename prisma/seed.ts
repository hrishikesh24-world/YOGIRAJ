import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean up
  await prisma.transaction.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.business.deleteMany()
  await prisma.user.deleteMany()

  // Create User & Business
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: 'hashed_password', // Mock since we hardcoded credentials
      name: 'Admin',
      business: {
        create: {
          name: 'Aqua Fresh Deliveries',
          phone: '9876543210',
          address: '123 Water St, Spring City',
          defaultPrice: 40,
        }
      }
    },
    include: { business: true }
  })

  const businessId = user.business!.id;

  // Create Customers
  const customersData = [
    { name: 'Rahul', phone: '9998887770', balance: 520, defaultPrice: 40 },
    { name: 'Priya', phone: '9998887771', balance: 0, defaultPrice: 40 },
    { name: 'Amit', phone: '9998887772', balance: 200, defaultPrice: 35 },
    { name: 'Sneha', phone: '9998887773', balance: 840, defaultPrice: 40 },
    { name: 'Ramesh', phone: '9998887774', balance: -50, defaultPrice: 45 },
  ];

  for (const c of customersData) {
    const customer = await prisma.customer.create({
      data: {
        businessId,
        name: c.name,
        phone: c.phone,
        balance: c.balance,
        defaultPrice: c.defaultPrice,
        totalCans: 10,
        totalBilled: 400,
        totalCollected: 400 - c.balance,
      }
    });

    // Add opening balance transaction
    await prisma.transaction.create({
      data: {
        customerId: customer.id,
        type: "OPENING_BALANCE",
        previousBalance: 0,
        newBalance: c.balance,
        notes: "Initial balance from old system",
      }
    });
  }

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
