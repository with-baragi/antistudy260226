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
        nationalPension = 0,
        retirementPension = 0
    } = params;

    // Convert rates to decimal
    const returnRateDecimal = expectedReturn / 100;
    const inflationRateDecimal = inflationRate / 100;

    // Scenario Rates
    const returnBullDecimal = Math.min((expectedReturn + 2) / 100, 1.0); // +2%p
    const returnBearDecimal = Math.max((expectedReturn - 2) / 100, 0.0); // -2%p

    // Calculate Future Monthly Values at retirement start
    const yearsToRetirement = Math.max(0, retirementAge - age);
    const futureMonthlyLivingExpense = monthlyLivingExpense * Math.pow(1 + inflationRateDecimal, yearsToRetirement);
    const futureMonthlyNationalPension = nationalPension * Math.pow(1 + inflationRateDecimal, yearsToRetirement);
    const futureMonthlyRetirementPension = retirementPension * Math.pow(1 + inflationRateDecimal, yearsToRetirement);

    // Helper to run a single simulation scenario
    const runScenario = (returnRate) => {
        let requiredBalance = 0;
        let totalTargetAssets = 0;
        let yearlyData = [];
        let currentBalance = currentAssets;
        let goldenTime = null;
        let totalRequiredAssets = 0;

        // 1. Calculate Target Asset needed at Retirement (Backward PV)
        // 은퇴 기간 중 "순수 부족 생활비(지출 - 연금)" 충당을 위해 은퇴 시점에 딱 필요한 금액 역산
        for (let currentYear = lifeExpectancy; currentYear >= retirementAge; currentYear--) {
            const yearsInRetirement = currentYear - retirementAge;
            const inflatedMonthlyExpense = futureMonthlyLivingExpense * Math.pow(1 + inflationRateDecimal, yearsInRetirement);

            // 연금 수령액 역시 물가상승률만큼의 가치 방어(상승)가 된다고 가정 (현실적 접근)
            const inflatedNational = futureMonthlyNationalPension * Math.pow(1 + inflationRateDecimal, yearsInRetirement);
            const inflatedRetirement = futureMonthlyRetirementPension * Math.pow(1 + inflationRateDecimal, yearsInRetirement);

            // 연금을 제하고도 순수하게 내 자산에서 빼서 써야 하는 월 부족액
            const monthlyShortfall = Math.max(0, inflatedMonthlyExpense - inflatedNational - inflatedRetirement);
            const yearlyExpense = monthlyShortfall * 12;

            // 역산 (기말잔액+당년도지출) / (1+수익률) = 기초잔액
            requiredBalance = (requiredBalance + yearlyExpense) / (1 + returnRate);
        }
        totalTargetAssets = requiredBalance;

        // 2. Run Forward Simulation (생애 자산 흐름)
        for (let currentYear = age; currentYear <= lifeExpectancy; currentYear++) {
            let isRetired = currentYear >= retirementAge;
            let yearlySavings = 0;
            let netYearlyExpense = 0;

            if (!isRetired) {
                yearlySavings = monthlySavings * 12;
            } else {
                const yearsInRetirement = currentYear - retirementAge;
                const inflatedMonthlyExpense = futureMonthlyLivingExpense * Math.pow(1 + inflationRateDecimal, yearsInRetirement);
                const inflatedNational = futureMonthlyNationalPension * Math.pow(1 + inflationRateDecimal, yearsInRetirement);
                const inflatedRetirement = futureMonthlyRetirementPension * Math.pow(1 + inflationRateDecimal, yearsInRetirement);

                // 실제 자산에서 인출해야 하는 순수 지출액 (연금 공제)
                const monthlyShortfall = Math.max(0, inflatedMonthlyExpense - inflatedNational - inflatedRetirement);
                netYearlyExpense = monthlyShortfall * 12;
            }

            // 기수 잔고 기반 수익 + 저축액 투입 - 생활비 인출
            currentBalance = currentBalance * (1 + returnRate) + yearlySavings - netYearlyExpense;

            if (currentYear === retirementAge) {
                totalRequiredAssets = currentBalance; // 은퇴 시작 시점에 도달한 실제 준비 예정 자산
            }

            if (currentBalance <= 0 && goldenTime === null) {
                goldenTime = currentYear;
                currentBalance = 0;
            }

            yearlyData.push({
                age: currentYear,
                assets: Math.max(0, Math.round(currentBalance)),
                isRetired
            });
        }

        return {
            yearlyData,
            goldenTime,
            totalRequiredAssets,
            totalTargetAssets
        };
    };

    // Run all 3 scenarios
    const baseScenario = runScenario(returnRateDecimal);
    const bullScenario = runScenario(returnBullDecimal);
    const bearScenario = runScenario(returnBearDecimal);

    // Combine results for the chart rendering
    let combinedYearlyData = [];
    for (let i = 0; i < baseScenario.yearlyData.length; i++) {
        combinedYearlyData.push({
            age: baseScenario.yearlyData[i].age,
            assets: baseScenario.yearlyData[i].assets, // Base scenario main line
            bullAssets: bullScenario.yearlyData[i].assets,
            bearAssets: bearScenario.yearlyData[i].assets,
            isRetired: baseScenario.yearlyData[i].isRetired
        });
    }

    // Status Evaluation (based on Base Scenario)
    let goldenTime = baseScenario.goldenTime;
    let status = "안전";
    if (goldenTime !== null) {
        if (goldenTime < lifeExpectancy - 5) {
            status = "위험";
        } else if (goldenTime <= lifeExpectancy) {
            status = "주의";
        }
    }

    return {
        yearlyData: combinedYearlyData, // Combined 3-line data
        goldenTime: baseScenario.goldenTime,
        bullGoldenTime: bullScenario.goldenTime,
        bearGoldenTime: bearScenario.goldenTime,
        totalRequiredAssets: Math.round(baseScenario.totalRequiredAssets),
        totalTargetAssets: Math.round(baseScenario.totalTargetAssets),
        assetGap: Math.round(baseScenario.totalRequiredAssets - baseScenario.totalTargetAssets),
        futureMonthlyLivingExpense: Math.round(futureMonthlyLivingExpense),
        status
    };
};
