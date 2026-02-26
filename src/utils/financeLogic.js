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
    // Approximate: sum of all future expenses during retirement, discounted to the retirement start, or just sum of inflated expenses
    // Simple approach: Monthly * 12 * Years in retirement (with inflation)
    let totalTargetAssets = 0;
    for (let currentYear = retirementAge; currentYear <= lifeExpectancy; currentYear++) {
        const yearsInRetirement = currentYear - retirementAge;
        const inflatedMonthlyExpense = futureMonthlyLivingExpense * Math.pow(1 + inflationRateDecimal, yearsInRetirement);
        totalTargetAssets += inflatedMonthlyExpense * 12;
    }

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
