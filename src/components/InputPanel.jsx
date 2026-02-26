import { Settings, Calculator, Wallet, TrendingUp } from 'lucide-react';

const InputPanel = ({ params, setParams }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        // Allow empty string for intermediate typing
        setParams(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }));
    };

    const InputGroup = ({ label, name, value, unit, min, max, step }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    name={name}
                    value={value}
                    onChange={handleChange}
                    min={min}
                    max={max}
                    step={step}
                    className="w-full pb-1 pt-2 px-3 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-deep-blue focus:border-deep-blue text-slate-900 transition-colors bg-slate-50"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 sm:text-sm">{unit}</span>
                </div>
            </div>
        </div>
    );

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
                    <InputGroup label="현재 나이" name="age" value={params.age} unit="세" min={20} max={100} step={1} />
                    <InputGroup label="은퇴 희망 나이" name="retirementAge" value={params.retirementAge} unit="세" min={20} max={100} step={1} />
                    <InputGroup label="기대 수명" name="lifeExpectancy" value={params.lifeExpectancy} unit="세" min={60} max={120} step={1} />
                </section>

                {/* Asset Info */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-deep-blue pb-2 border-b border-slate-200">
                        <Wallet className="w-4 h-4" />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">자산 정보</h3>
                    </div>
                    <InputGroup label="현재 준비된 은퇴 자산" name="currentAssets" value={params.currentAssets} unit="원" step={1000000} />
                    <InputGroup label="월 저축 가능 금액" name="monthlySavings" value={params.monthlySavings} unit="원" step={100000} />
                </section>

                {/* Economy Assumption */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-deep-blue pb-2 border-b border-slate-200">
                        <TrendingUp className="w-4 h-4" />
                        <h3 className="font-semibold text-sm uppercase tracking-wider">경제 가정</h3>
                    </div>
                    <InputGroup label="예상 투자 수익률" name="expectedReturn" value={params.expectedReturn} unit="%" step={0.1} />
                    <InputGroup label="예상 물가 상승률" name="inflationRate" value={params.inflationRate} unit="%" step={0.1} />
                    <InputGroup label="은퇴 후 월 필요 생활비 (현재 가치)" name="monthlyLivingExpense" value={params.monthlyLivingExpense} unit="원" step={100000} />
                </section>
            </div>
        </div>
    );
};

export default InputPanel;
