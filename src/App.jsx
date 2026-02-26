import { useState, useEffect } from 'react';
import { calculateRetirementPlan } from './utils/financeLogic';
import InputPanel from './components/InputPanel';
import Dashboard from './components/Dashboard';

function App() {
    const [params, setParams] = useState({
        age: 40,
        retirementAge: 60,
        lifeExpectancy: 90,
        currentAssets: 100000000, // 1억
        monthlySavings: 1000000,  // 100만
        expectedReturn: 5.0,
        inflationRate: 2.5,
        monthlyLivingExpense: 3000000, // 300만
        nationalPension: 0,
        retirementPension: 0
    });

    const [result, setResult] = useState(null);

    useEffect(() => {
        const calculatedResult = calculateRetirementPlan(params);
        setResult(calculatedResult);
    }, [params]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800 font-sans selection:bg-deep-blue/20">
            {/* Sidebar Input Panel */}
            <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 shadow-sm overflow-y-auto">
                <InputPanel params={params} setParams={setParams} />
            </div>

            {/* Main Dashboard Area */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                <Dashboard result={result} params={params} />
            </div>
        </div>
    );
}

export default App;
