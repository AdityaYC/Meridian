import prisma from '../config/database';

async function seedMeridianData(userId: string) {
  console.log('🌱 Seeding Meridian data for user:', userId);

  try {
    // 1. Create Smart Notifications
    console.log('Creating notifications...');
    await prisma.notification.createMany({
      data: [
        {
          userId,
          type: 'budget_alert',
          title: 'Budget Alert: Dining',
          message: 'You\'ve spent 85% of your dining budget this month',
          severity: 'warning',
          isRead: false,
        },
        {
          userId,
          type: 'unusual_transaction',
          title: 'Unusual Transaction Detected',
          message: 'Large transaction of $450 at Electronics Store',
          severity: 'high',
          isRead: false,
        },
        {
          userId,
          type: 'bill_reminder',
          title: 'Bill Due Soon',
          message: 'Your Netflix subscription is due in 3 days',
          severity: 'medium',
          isRead: false,
        },
        {
          userId,
          type: 'insight',
          title: 'Savings Opportunity',
          message: 'You could save $120/month by reducing dining expenses',
          severity: 'low',
          isRead: true,
        },
      ],
    });

    // 2. Create Bills
    console.log('Creating bills...');
    const today = new Date();
    const bills = [
      {
        userId,
        name: 'Netflix',
        amount: 15.99,
        category: 'Entertainment',
        frequency: 'monthly' as const,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 15),
        nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
        isAutoPay: true,
        status: 'active' as const,
      },
      {
        userId,
        name: 'Electric Bill',
        amount: 120.50,
        category: 'Utilities',
        frequency: 'monthly' as const,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 1),
        nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 1),
        isAutoPay: false,
        status: 'active' as const,
      },
      {
        userId,
        name: 'Internet',
        amount: 79.99,
        category: 'Utilities',
        frequency: 'monthly' as const,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 10),
        nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 10),
        isAutoPay: true,
        status: 'active' as const,
      },
      {
        userId,
        name: 'Gym Membership',
        amount: 45.00,
        category: 'Health',
        frequency: 'monthly' as const,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 5),
        nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 5),
        isAutoPay: true,
        status: 'active' as const,
      },
      {
        userId,
        name: 'Car Insurance',
        amount: 150.00,
        category: 'Insurance',
        frequency: 'monthly' as const,
        dueDate: new Date(today.getFullYear(), today.getMonth(), 20),
        nextDueDate: new Date(today.getFullYear(), today.getMonth() + 1, 20),
        isAutoPay: true,
        status: 'active' as const,
      },
    ];

    for (const bill of bills) {
      await prisma.bill.create({ data: bill });
    }

    // 3. Create Financial Health Score
    console.log('Creating financial health score...');
    await prisma.financialHealthScore.create({
      data: {
        userId,
        overallScore: 72,
        emergencyFundScore: 65,
        debtManagementScore: 80,
        savingsRateScore: 70,
        investmentDiversityScore: 68,
        budgetAdherenceScore: 75,
        recommendations: JSON.stringify([
          'Build emergency fund to 6 months of expenses',
          'Consider increasing retirement contributions',
          'Reduce dining expenses by 15%',
        ]),
      },
    });

    // 4. Create Cash Flow Predictions
    console.log('Creating cash flow predictions...');
    const predictions = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      predictions.push({
        userId,
        predictionDate: date,
        predictedBalance: 3500 + (Math.random() * 1000) - (i * 20),
        confidenceScore: 0.75 + (Math.random() * 0.2),
      });
    }
    await prisma.cashFlowPrediction.createMany({ data: predictions });

    // 5. Create Tax Deductions (for current year)
    console.log('Creating tax deductions...');
    const currentYear = new Date().getFullYear();
    await prisma.taxDeduction.createMany({
      data: [
        {
          userId,
          category: 'business_expense',
          amount: 450.00,
          description: 'Office supplies and equipment',
          date: new Date(currentYear, 3, 15),
          taxYear: currentYear,
        },
        {
          userId,
          category: 'charitable',
          amount: 200.00,
          description: 'Donation to local charity',
          date: new Date(currentYear, 6, 20),
          taxYear: currentYear,
        },
        {
          userId,
          category: 'medical',
          amount: 350.00,
          description: 'Medical expenses',
          date: new Date(currentYear, 8, 10),
          taxYear: currentYear,
        },
      ],
    });

    // 6. Create Wealth Milestones
    console.log('Creating wealth roadmap...');
    const milestones = [
      {
        userId,
        milestoneType: 'emergency_fund',
        targetAmount: 10000,
        currentAmount: 6500,
        progressPercent: 65,
        status: 'in_progress' as const,
        orderIndex: 1,
      },
      {
        userId,
        milestoneType: 'debt_free',
        targetAmount: 0,
        currentAmount: 5000,
        progressPercent: 75,
        status: 'in_progress' as const,
        orderIndex: 2,
      },
      {
        userId,
        milestoneType: 'retirement_start',
        targetAmount: 5000,
        currentAmount: 5000,
        progressPercent: 100,
        status: 'completed' as const,
        orderIndex: 3,
      },
      {
        userId,
        milestoneType: 'net_worth_50k',
        targetAmount: 50000,
        currentAmount: 32000,
        progressPercent: 64,
        status: 'in_progress' as const,
        orderIndex: 4,
      },
      {
        userId,
        milestoneType: 'max_retirement',
        targetAmount: 20000,
        currentAmount: 8000,
        progressPercent: 40,
        status: 'not_started' as const,
        orderIndex: 5,
      },
      {
        userId,
        milestoneType: 'net_worth_100k',
        targetAmount: 100000,
        currentAmount: 32000,
        progressPercent: 32,
        status: 'not_started' as const,
        orderIndex: 6,
      },
    ];

    for (const milestone of milestones) {
      await prisma.wealthMilestone.create({ data: milestone });
    }

    // 7. Create Smart Budget
    console.log('Creating smart budget...');
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const budgetCategories = [
      { category: 'Dining', allocated: 500, spent: 425 },
      { category: 'Groceries', allocated: 600, spent: 480 },
      { category: 'Transportation', allocated: 300, spent: 245 },
      { category: 'Entertainment', allocated: 200, spent: 150 },
      { category: 'Shopping', allocated: 400, spent: 520 },
      { category: 'Utilities', allocated: 250, spent: 200 },
      { category: 'Health', allocated: 150, spent: 45 },
    ];

    for (const cat of budgetCategories) {
      await prisma.smartBudget.create({
        data: {
          userId,
          category: cat.category,
          month: currentMonth,
          allocatedAmount: cat.allocated,
          spentAmount: cat.spent,
          autoAdjust: true,
        },
      });
    }

    // 8. Create some sample receipts
    console.log('Creating receipts...');
    await prisma.receipt.createMany({
      data: [
        {
          userId,
          imageUrl: 'https://via.placeholder.com/400x600/4F46E5/FFFFFF?text=Grocery+Receipt',
          merchantName: 'Whole Foods',
          amount: 87.50,
          date: new Date(),
          category: 'Groceries',
          ocrText: 'Whole Foods Market\nTotal: $87.50',
        },
        {
          userId,
          imageUrl: 'https://via.placeholder.com/400x600/10B981/FFFFFF?text=Restaurant+Receipt',
          merchantName: 'Italian Restaurant',
          amount: 65.00,
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          category: 'Dining',
          ocrText: 'Italian Restaurant\nTotal: $65.00',
        },
      ],
    });

    console.log('✅ Meridian data seeded successfully!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

export default seedMeridianData;
