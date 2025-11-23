import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Find the first user or create one
    let user = await prisma.user.findFirst();

    if (!user) {
        console.log('⚠️ No user found. Creating default user...');
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('password123', 10);

        user = await prisma.user.create({
            data: {
                email: 'demo@meridian.com',
                passwordHash: hashedPassword,
                firstName: 'Alex',
                lastName: 'Rivera',
                phoneNumber: '555-0123',
            }
        });
        console.log('✅ Created default user: demo@meridian.com / password123');
    }

    console.log(`📝 Seeding data for user: ${user.email}`);

    // Delete existing data
    await prisma.transaction.deleteMany({ where: { userId: user.id } });
    await prisma.budget.deleteMany({ where: { userId: user.id } });
    await prisma.bankAccount.deleteMany({ where: { userId: user.id } });

    // Create Student Bank Accounts
    const checkingAccount = await prisma.bankAccount.create({
        data: {
            userId: user.id,
            tellerAccountId: 'fake_checking_123',
            institutionName: 'Chase',
            accountName: 'Student Checking',
            accountType: 'checking',
            accountNumber: '4321',
            available: 847.50,
            current: 847.50,
            currency: 'USD',
            status: 'active',
        },
    });

    const savingsAccount = await prisma.bankAccount.create({
        data: {
            userId: user.id,
            tellerAccountId: 'fake_savings_456',
            institutionName: 'Chase',
            accountName: 'Emergency Savings',
            accountType: 'savings',
            accountNumber: '8765',
            available: 1250.00,
            current: 1250.00,
            currency: 'USD',
            status: 'active',
        },
    });

    const creditCard = await prisma.bankAccount.create({
        data: {
            userId: user.id,
            tellerAccountId: 'fake_credit_789',
            institutionName: 'Discover',
            accountName: 'Student Credit Card',
            accountType: 'credit',
            accountNumber: '7890',
            available: 1500.00,
            current: -342.75,
            limit: 1500.00,
            currency: 'USD',
            status: 'active',
        },
    });

    console.log('✅ Created 3 bank accounts');

    // Student Transaction Data
    const transactions = [
        // Today
        { merchant: 'Campus Vending Machine', amount: -2.50, category: 'Food & Dining', date: new Date(), type: 'debit' },
        { merchant: 'Starbucks - Student Union', amount: -5.75, category: 'Food & Dining', date: new Date(), type: 'debit' },

        // Yesterday
        { merchant: 'Uber', amount: -12.00, category: 'Transportation', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Campus Bookstore', amount: -87.50, category: 'Education', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Dining Hall', amount: -15.00, category: 'Food & Dining', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), type: 'debit' },

        // 2 days ago
        { merchant: 'Amazon - Textbooks', amount: -125.99, category: 'Education', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Netflix', amount: -9.99, category: 'Entertainment', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Spotify Premium Student', amount: -5.99, category: 'Entertainment', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: 'debit' },

        // 3 days ago
        { merchant: 'Target', amount: -43.20, category: 'Shopping', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Chipotle', amount: -11.50, category: 'Food & Dining', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Gas Station', amount: -35.00, category: 'Transportation', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), type: 'debit' },

        // This week
        { merchant: 'Part-Time Job - Direct Deposit', amount: 350.00, category: 'Income', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), type: 'credit' },
        { merchant: 'Panera Bread', amount: -8.75, category: 'Food & Dining', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Campus Coffee Shop', amount: -4.50, category: 'Food & Dining', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Uber Eats', amount: -23.50, category: 'Food & Dining', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Gym Membership', amount: -20.00, category: 'Health & Fitness', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), type: 'debit' },

        // Last 2 weeks
        { merchant: 'Walmart - Groceries', amount: -67.80, category: 'Groceries', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'McDonald\'s', amount: -7.25, category: 'Food & Dining', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Campus Vending Machine', amount: -1.75, category: 'Food & Dining', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Lyft', amount: -15.50, category: 'Transportation', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Movie Theatre', amount: -14.00, category: 'Entertainment', date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'CVS Pharmacy', amount: -18.50, category: 'Health & Fitness', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Campus Bookstore', amount: -45.00, category: 'Education', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Subway', amount: -9.50, category: 'Food & Dining', date: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Part-Time Job - Direct Deposit', amount: 350.00, category: 'Income', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), type: 'credit' },
        { merchant: 'Pizza Hut', amount: -18.75, category: 'Food & Dining', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Apple Music', amount: -10.99, category: 'Entertainment', date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), type: 'debit' },

        // Last month
        { merchant: 'Rent Payment', amount: -650.00, category: 'Housing', date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Utilities - Electric', amount: -45.00, category: 'Bills & Utilities', date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Internet Bill', amount: -55.00, category: 'Bills & Utilities', date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Target - School Supplies', amount: -32.50, category: 'Education', date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Taco Bell', amount: -6.50, category: 'Food & Dining', date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Gas Station', amount: -40.00, category: 'Transportation', date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Part-Time Job - Direct Deposit', amount: 350.00, category: 'Income', date: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), type: 'credit' },
        { merchant: 'Starbucks', amount: -6.25, category: 'Food & Dining', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Campus Laundry', amount: -5.00, category: 'Personal Care', date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Domino\'s Pizza', amount: -16.00, category: 'Food & Dining', date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Campus Parking', amount: -15.00, category: 'Transportation', date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Walmart - Groceries', amount: -55.30, category: 'Groceries', date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Best Buy - Laptop Charger', amount: -65.00, category: 'Education', date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Part-Time Job - Direct Deposit', amount: 350.00, category: 'Income', date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000), type: 'credit' },
        { merchant: 'Five Guys', amount: -13.50, category: 'Food & Dining', date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Concert Tickets', amount: -45.00, category: 'Entertainment', date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), type: 'debit' },
        { merchant: 'Uber', amount: -9.50, category: 'Transportation', date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), type: 'debit' },
    ];

    // Create transactions
    let txCounter = 1;
    for (const tx of transactions) {
        await prisma.transaction.create({
            data: {
                userId: user.id,
                bankAccountId: checkingAccount.id,
                tellerTransactionId: `fake_tx_${txCounter++}`,
                merchantName: tx.merchant,
                amount: tx.amount,
                category: tx.category,
                date: tx.date,
                type: tx.type,
                status: 'completed',
                description: tx.merchant,
            },
        });
    }

    console.log(`✅ Created ${transactions.length} student transactions`);

    // Create Student Budgets
    const budgets = [
        { category: 'Food & Dining', monthlyLimit: 300, currentSpent: 180.50 },
        { category: 'Transportation', monthlyLimit: 150, currentSpent: 82.00 },
        { category: 'Entertainment', monthlyLimit: 100, currentSpent: 85.98 },
        { category: 'Education', monthlyLimit: 400, currentSpent: 355.99 },
        { category: 'Groceries', monthlyLimit: 200, currentSpent: 123.10 },
        { category: 'Housing', monthlyLimit: 750, currentSpent: 650.00 },
    ];

    for (const budget of budgets) {
        await prisma.budget.create({
            data: {
                userId: user.id,
                category: budget.category,
                monthlyLimit: budget.monthlyLimit,
                currentSpent: budget.currentSpent,
                month: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
        });
    }

    console.log('✅ Created 6 student budgets');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 3 Bank Accounts (Total: $${(847.50 + 1250.00 - 342.75).toFixed(2)})`);
    console.log(`   - ${transactions.length} Transactions`);
    console.log(`   - 6 Budgets`);
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
