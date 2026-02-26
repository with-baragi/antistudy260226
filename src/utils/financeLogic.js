export const calculateRetirementPlan = (params) => {
    const {
        age,
        retirementAge,
        lifeExpectancy,
        currentAssets,
        monthlySavings,
        expectedReturn,
        inflationRate,
        monthlyLivingExpense, // current value
    } = params;

    // Convert rates to decimal
    const returnRateDecimal = expectedReturn / 100;
    const inflationRateDecimal = inflationRate / 100;

    // 1. Calculate Future Monthly Living Expense at retirement
    const yearsToRetirement = Math.max(0, retirementAge - age);
    const futureMonthlyLivingExpense = monthlyLivingExpense * Math.pow(1 + inflationRateDecimal, yearsToRetirement);

    // 2. Calculate the "Ideal Target Assets" needed exactly at retirement
    // 역산(Backward PV) 방식: 은퇴 후 매년 발생하는 예상 생활비를 기대 수명까지 
    // 충당하기 위해 은퇴 시작 시점에 '정확히' 얼마가 있어야 하는지 계산.
    // 은퇴 기간 중에도 남아있는 자산은 '예상 투자 수익률'만큼 복리로 계속 증식한다고 가정.
    let requiredBalance = 0;
    for (let currentYear = lifeExpectancy; currentYear >= retirementAge; currentYear--) {
        const yearsInRetirement = currentYear - retirementAge;
        const inflatedMonthlyExpense = futureMonthlyLivingExpense * Math.pow(1 + inflationRateDecimal, yearsInRetirement);
        const yearlyExpense = inflatedMonthlyExpense * 12;

        // 역산 로직: (기말 잔액 + 당해 지출) / (1 + 수익률) = 기초 잔액
        requiredBalance = (requiredBalance + yearlyExpense) / (1 + returnRateDecimal);
    }
    const totalTargetAssets = requiredBalance;

    let yearlyData = [];
    let currentBalance = currentAssets;
    let goldenTime = null;
    let totalRequiredAssets = 0; // Actual accumulated assets at retirement

    for (let currentYear = age; currentYear <= lifeExpectancy; currentYear++) {
        let isRetired = currentYear >= retirementAge;

        // Calculate income and expenses for the year
        let yearlySavings = 0;
        let yearlyExpense = 0;

        if (!isRetired) {
            yearlySavings = monthlySavings * 12;
        } else {
            // Inflate the expense for the current year during retirement
            const yearsInRetirement = currentYear - retirementAge;
            const inflatedMonthlyExpense = futureMonthlyLivingExpense * Math.pow(1 + inflationRateDecimal, yearsInRetirement);
            yearlyExpense = inflatedMonthlyExpense * 12;
        }

        // Apply return on the balance BEFORE adding/subtracting flows, or average it.
        // For simplicity, apply return on the beginning balance, then add savings or subtract expenses.
        currentBalance = currentBalance * (1 + returnRateDecimal) + yearlySavings - yearlyExpense;

        if (currentYear === retirementAge) {
            totalRequiredAssets = currentBalance; // Balance exactly at retirement
        }

        if (currentBalance <= 0 && goldenTime === null) {
            goldenTime = currentYear;
            currentBalance = 0; // Prevent massive negative numbers from ruining the chart scale
        }

        yearlyData.push({
            age: currentYear,
            assets: Math.max(0, Math.round(currentBalance)),
            isRetired
        });
    }

    // Status Evaluation
    let status = "안전"; // Safe
    if (goldenTime !== null) {
        if (goldenTime < lifeExpectancy - 5) {
            status = "위험"; // Danger
        } else if (goldenTime <= lifeExpectancy) {
            status = "주의"; // Warning
        }
    }

    return {
        yearlyData,
        goldenTime,
        totalRequiredAssets: Math.round(totalRequiredAssets), // Actually Accumulated at Retirement
        totalTargetAssets: Math.round(totalTargetAssets),     // Theoretically Needed completely
        assetGap: Math.round(totalRequiredAssets - totalTargetAssets),
        futureMonthlyLivingExpense: Math.round(futureMonthlyLivingExpense),
        status
    };
};
