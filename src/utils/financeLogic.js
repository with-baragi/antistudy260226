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

    let yearlyData = [];
    let currentBalance = currentAssets;
    let goldenTime = null;
    let totalRequiredAssets = 0; // The target asset at retirement

    for (let currentYear = age; currentYear <= lifeExpectancy; currentYear++) {
        const isRetired = currentYear >= retirementAge;

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
        totalRequiredAssets: Math.round(totalRequiredAssets),
        futureMonthlyLivingExpense: Math.round(futureMonthlyLivingExpense),
        status
    };
};
