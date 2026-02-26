import {
    ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
    BarChart, Bar, Cell
} from 'recharts';
import { AlertCircle, CheckCircle, AlertTriangle, Target, TrendingDown, TrendingUp, Wallet, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const formatCurrency = (value) => {
    if (value >= 100000000) {
        return `${(value / 100000000).toFixed(1).replace(/\.0$/, '')}억`;
    }
    if (value >= 10000) {
        return `${(value / 10000).toFixed(0)}만`;
    }
    return String(value);
};

const formatFullCurrency = (value) => {
    return new Intl.NumberFormat('ko-KR').format(Math.round(value)) + '원';
};

const Dashboard = ({ result, params }) => {
    if (!result) return null;

    const {
        yearlyData, goldenTime, bullGoldenTime, bearGoldenTime,
        totalRequiredAssets, totalTargetAssets, assetGap, status
    } = result;

    const StatusIcon = () => {
        if (status === '안전') return <CheckCircle className="w-8 h-8 text-green-500" />;
        if (status === '주의') return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
        return <AlertCircle className="w-8 h-8 text-red-500" />;
    };

    const statusColors = {
        '안전': 'border-green-200 bg-green-50 text-green-800',
        '주의': 'border-yellow-200 bg-yellow-50 text-yellow-800',
        '위험': 'border-red-200 bg-red-50 text-red-800'
    };

    const isSurplus = assetGap >= 0;

    // Data for the comparison bar chart
    const comparisonData = [
        { name: '필요 목표 자산', value: totalTargetAssets, fill: '#64748B' },
        { name: '준비 예정 자산', value: totalRequiredAssets, fill: '#1E3A8A' }
    ];

    const handleDownloadPdf = () => {
        const element = document.getElementById('dashboard-content');
        const opt = {
            margin: 5,
            filename: 'retirement_report.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div id="dashboard-content" className="space-y-8 max-w-6xl mx-auto p-4 bg-slate-50">
            {/* Header with Image & Status */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                <div className="flex items-center gap-6 z-10">
                    <img
                        src="/hero-image.png"
                        alt="Retirement Planning"
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl shadow-md border border-slate-100"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-deep-blue mb-2 tracking-tight">시뮬레이션 결과 리포트</h1>
                        <p className="text-sm sm:text-base text-slate-500 max-w-md">고객님의 현재 자산과 월 투자 금액을 바탕으로 은퇴 시점의 목표 달성 여부를 다각도로 분석했습니다.</p>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3 z-10">
                    <button
                        onClick={handleDownloadPdf}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-200"
                    >
                        <Download className="w-4 h-4" />
                        리포트 PDF 저장
                    </button>
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-full border shadow-sm ${statusColors[status]}`}>
                        <StatusIcon />
                        <div>
                            <div className="text-sm opacity-80 font-medium">현재 플랜 진단</div>
                            <div className="font-bold text-xl">{status} 상태</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-slate-400" />
                        <p className="text-sm text-slate-500 font-medium">은퇴 시점 필요 목표 자산</p>
                    </div>
                    <p className="text-3xl font-bold text-slate-700">{formatFullCurrency(totalTargetAssets)}</p>
                    <p className="text-xs text-slate-400 mt-2">연금 수입을 제외한 순수 필요액</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center border-l-4 border-l-deep-blue">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-5 h-5 text-deep-blue" />
                        <p className="text-sm text-deep-blue font-bold">은퇴 시점 준비 예정 자산</p>
                    </div>
                    <p className="text-3xl font-black text-deep-blue">{formatFullCurrency(totalRequiredAssets)}</p>
                    <p className="text-xs text-slate-500 mt-2">{params.retirementAge}세 진입 시 예상 누적 자산</p>
                </div>

                <div className={`p-6 rounded-2xl shadow-sm border flex flex-col justify-center relative overflow-hidden ${isSurplus ? 'bg-sky-50 border-sky-200' : 'bg-rose-50 border-rose-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {isSurplus ? <TrendingUp className="w-5 h-5 text-sky-600" /> : <TrendingDown className="w-5 h-5 text-rose-600" />}
                        <p className={`text-sm font-bold ${isSurplus ? 'text-sky-700' : 'text-rose-700'}`}>
                            {isSurplus ? '예상 초과 달성액' : '예상 부족 금액'}
                        </p>
                    </div>
                    <p className={`text-3xl font-black ${isSurplus ? 'text-sky-600' : 'text-rose-600'}`}>
                        {isSurplus ? '+' : ''}{formatFullCurrency(assetGap)}
                    </p>
                    <p className={`text-xs mt-2 ${isSurplus ? 'text-sky-600/70' : 'text-rose-600/70'}`}>
                        {isSurplus ? '여유로운 은퇴 생활이 기대됩니다.' : '추가적인 투자 또는 지출 조정이 필요합니다.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Target vs Actual Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 flex flex-col">
                    <h3 className="text-lg font-bold text-deep-blue mb-1">목표 달성 분석</h3>
                    <p className="text-xs text-slate-500 mb-6">은퇴 시점({params.retirementAge}세) 기준</p>
                    <div className="flex-1 min-h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={60}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={formatCurrency} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                                <Tooltip
                                    formatter={(value) => [formatFullCurrency(value), '금액']}
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {comparisonData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Main Multi-Scenario Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-deep-blue mb-2">연도별 생애 자산 흐름 시나리오</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                    기본: {goldenTime ? `${goldenTime}세 고갈` : '고갈 없음'}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    강세장(+2%p): {bullGoldenTime ? `${bullGoldenTime}세 고갈` : '고갈 없음'}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                                    약세장(-2%p): {bearGoldenTime ? `${bearGoldenTime}세 고갈` : '고갈 없음'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 sm:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={yearlyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis
                                    dataKey="age"
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={{ stroke: '#CBD5E1' }}
                                    tickFormatter={(val) => `${val}세`}
                                />
                                <YAxis
                                    tickFormatter={formatCurrency}
                                    tick={{ fill: '#64748B', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={70}
                                />
                                <Tooltip
                                    formatter={(value, name) => {
                                        let label = '기본 예상 자산';
                                        if (name === 'bullAssets') label = '강세장 (수익률 +2%p)';
                                        if (name === 'bearAssets') label = '약세장 (수익률 -2%p)';
                                        return [formatFullCurrency(value), label];
                                    }}
                                    labelFormatter={(label) => `${label}세 기준`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                />

                                <ReferenceLine
                                    x={params.retirementAge}
                                    stroke="#64748B"
                                    strokeDasharray="5 5"
                                    label={{ position: 'top', value: '은퇴 시작', fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="assets"
                                    stroke="#1E3A8A"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAssets)"
                                    name="assets"
                                />
                                <Line type="monotone" dataKey="bullAssets" stroke="#10B981" strokeDasharray="5 5" strokeWidth={2} dot={false} name="bullAssets" />
                                <Line type="monotone" dataKey="bearAssets" stroke="#F43F5E" strokeDasharray="5 5" strokeWidth={2} dot={false} name="bearAssets" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
