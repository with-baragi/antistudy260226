import { useState, useEffect } from 'react';
import { Settings, Calculator, Wallet, TrendingUp } from 'lucide-react';

const InputPanel = ({ params, setParams }) => {

    const InputGroup = ({ label, name, value, unit, min, max, step }) => {
        // Local state for formatting during typing
        const [localValue, setLocalValue] = useState(value);

        // Sync local state if parent prop changes externally
        useEffect(() => {
            setLocalValue(value);
        }, [value]);

        const handleChange = (e) => {
            const rawVal = e.target.value.replace(/,/g, '');
            // Only allow numbers or empty string
            if (rawVal === '' || /^\d*\.?\d*$/.test(rawVal)) {
                setLocalValue(rawVal);
            }
        };

        const handleBlur = () => {
            // On blur, push the parsed value up to the parent and re-format local
            let parsed = parseFloat(localValue);
            if (isNaN(parsed)) {
                parsed = 0;
            }
            if (min !== undefined && parsed < min) parsed = min;
            if (max !== undefined && parsed > max) parsed = max;

            setLocalValue(parsed);
            setParams(prev => ({ ...prev, [name]: parsed }));
        };

        // Format for display: Add commas if it's a valid number string.
        const displayValue = localValue === '' || localValue === '-'
            ? localValue
            : new Intl.NumberFormat('en-US').format(localValue);

        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <div className="relative">
                    <input
                        type="text"
                        name={name}
                        value={displayValue}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full pb-1 pt-2 px-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-deep-blue focus:border-deep-blue text-slate-900 transition-colors bg-slate-50"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 sm:text-sm">{unit}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
                <Calculator className="w-6 h-6 text-deep-blue" />
                <h2 className="text-xl font-bold text-slate-900">은퇴 설계 시뮬레이터</h2>
            </div>

            <div className="space-y-8">
                {/* Basic Info */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-deep-blue pb-2 border-b border-slate-200">
                        <Settings className="w-4 h-4" />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">기본 정보</h3>
                    </div>
                    <InputGroup label="현재 나이" name="age" value={params.age} unit="세" min={20} max={100} />
                    <InputGroup label="은퇴 희망 나이" name="retirementAge" value={params.retirementAge} unit="세" min={20} max={100} />
                    <InputGroup label="기대 수명" name="lifeExpectancy" value={params.lifeExpectancy} unit="세" min={60} max={120} />
                </section>

                {/* Asset Info */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-deep-blue pb-2 border-b border-slate-200">
                        <Wallet className="w-4 h-4" />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">자산 정보</h3>
                    </div>
                    <InputGroup label="현재 준비된 은퇴 자산" name="currentAssets" value={params.currentAssets} unit="원" min={0} />
                    <InputGroup label="월 투자 가능 금액" name="monthlySavings" value={params.monthlySavings} unit="원" min={0} />
                </section>

                {/* Economy Assumption */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-deep-blue pb-2 border-b border-slate-200">
                        <TrendingUp className="w-4 h-4" />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">경제 가정</h3>
                    </div>
                    <InputGroup label="예상 투자 수익률" name="expectedReturn" value={params.expectedReturn} unit="%" min={0} max={100} />
                    <InputGroup label="예상 물가 상승률" name="inflationRate" value={params.inflationRate} unit="%" min={0} max={100} />
                    <InputGroup label="은퇴 후 월 필요 생활비 (현재 가치)" name="monthlyLivingExpense" value={params.monthlyLivingExpense} unit="원" min={0} />
                </section>
            </div>
        </div>
    );
};

export default InputPanel;
