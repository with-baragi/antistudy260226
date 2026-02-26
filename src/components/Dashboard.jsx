import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

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

    const { yearlyData, goldenTime, totalRequiredAssets, futureMonthlyLivingExpense, status } = result;

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

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Header & Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-deep-blue mb-1">시뮬레이션 결과 리포트</h1>
                    <p className="text-sm text-slate-500">입력하신 데이터를 바탕으로 산출된 예상 자산 흐름입니다.</p>
                </div>
                <div className={`flex items-center gap-3 px-6 py-3 rounded-full border ${statusColors[status]}`}>
                    <StatusIcon />
                    <div>
                        <div className="font-bold text-lg">플랜 상태: {status}</div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
                    <p className="text-sm text-slate-500 font-medium mb-1">은퇴 시점 필요 자산 총액</p>
                    <p className="text-3xl font-bold text-deep-blue">{formatFullCurrency(totalRequiredAssets)}</p>
                    <p className="text-xs text-slate-400 mt-2">{params.retirementAge}세 진입 시 예상 자산</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
                    <p className="text-sm text-slate-500 font-medium mb-1">은퇴 후 필요 생활비 (미래 가치)</p>
                    <p className="text-3xl font-bold text-slate-800">{formatFullCurrency(futureMonthlyLivingExpense)}</p>
                    <p className="text-xs text-slate-400 mt-2">월 기준 / 첫 해 반영 금액</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center relative overflow-hidden">
                    <p className="text-sm text-slate-500 font-medium mb-1">자산 고갈 예상 나이</p>
                    <p className="text-4xl font-black text-rose-600">
                        {goldenTime ? `${goldenTime}세` : '고갈 없음'}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">저축금 및 수익률 반영 기준</p>
                    {goldenTime && (
                        <div className="absolute -right-4 -bottom-4 opacity-10">
                            <AlertCircle className="w-32 h-32 text-rose-600" />
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-deep-blue mb-6">연도별 자산 흐름 추이</h3>
                <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
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
                                width={80}
                            />
                            <Tooltip
                                formatter={(value) => [formatFullCurrency(value), '보유 자산']}
                                labelFormatter={(label) => `${label}세 기준`}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                            />

                            <ReferenceLine
                                x={params.retirementAge}
                                stroke="#64748B"
                                strokeDasharray="5 5"
                                label={{ position: 'top', value: '은퇴 시점', fill: '#64748B', fontSize: 12 }}
                            />

                            {goldenTime && (
                                <ReferenceLine
                                    x={goldenTime}
                                    stroke="#E11D48"
                                    strokeDasharray="5 5"
                                    label={{ position: 'top', value: '자산 고갈', fill: '#E11D48', fontSize: 12, fontWeight: 'bold' }}
                                />
                            )}

                            <Area
                                type="monotone"
                                dataKey="assets"
                                stroke="#1E3A8A"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorAssets)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
