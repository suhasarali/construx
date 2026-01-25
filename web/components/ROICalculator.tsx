'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Calculator, DollarSign, Percent, Scaling } from 'lucide-react';

export default function ROICalculator() {
    const [investment, setInvestment] = useState<string>('');
    const [sqFt, setSqFt] = useState<string>('');
    const [margin, setMargin] = useState<string>('20');

    const [result, setResult] = useState<{
        breakEven: number;
        profitablePrice: number;
        totalRevenue: number;
        profit: number;
    } | null>(null);

    useEffect(() => {
        calculate();
    }, [investment, sqFt, margin]);

    const calculate = () => {
        const inv = parseFloat(investment);
        const area = parseFloat(sqFt);
        const profitMargin = parseFloat(margin) || 0;

        if (!inv || !area || area <= 0) {
            setResult(null);
            return;
        }

        const breakEven = inv / area;
        const totalRevenue = inv * (1 + profitMargin / 100);
        const profit = totalRevenue - inv;
        const profitablePrice = totalRevenue / area;

        setResult({
            breakEven,
            profitablePrice,
            totalRevenue,
            profit
        });
    };

    return (
        <Card className="h-full p-6 border-none shadow-lg bg-card/50 backdrop-blur-sm ring-1 ring-border/50 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Calculator size={18} className="text-yellow-500" />
                        ROI Projector
                    </h2>
                    <p className="text-xs text-muted-foreground">Profitability Forecaster</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                {/* Inputs */}
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <DollarSign size={12} /> Total Investment
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 10,000,000"
                            value={investment}
                            onChange={(e) => setInvestment(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Scaling size={12} /> Total Area (Sq Ft)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 5000"
                            value={sqFt}
                            onChange={(e) => setSqFt(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <Percent size={12} /> Target Margin %
                        </label>
                        <input
                            type="number"
                            placeholder="20"
                            value={margin}
                            onChange={(e) => setMargin(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:ring-2 focus:ring-yellow-500/20 outline-none transition-all"
                        />
                        <div className="flex gap-2 mt-1">
                            {[15, 20, 30].map(m => (
                                <button
                                    key={m}
                                    onClick={() => setMargin(m.toString())}
                                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${margin === m.toString()
                                            ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-600'
                                            : 'bg-muted border-transparent text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {m}%
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results - Auto Calculated */}
                <div className="bg-muted/30 rounded-xl p-4 flex flex-col justify-center space-y-4 border border-border/50">
                    <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Break-Even Price / Sq Ft</p>
                        <div className="text-lg font-bold text-foreground">
                            {result ? `₹${result.breakEven.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
                        </div>
                    </div>

                    <div className="space-y-1 relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full"></div>
                        <div className="pl-3">
                            <p className="text-xs font-medium text-yellow-600 mb-1">Target Selling Price</p>
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                {result ? `₹${result.profitablePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—'}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                per sq. ft.
                            </p>
                        </div>
                    </div>

                    {result && (
                        <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-[10px] text-muted-foreground">Proj. Revenue</p>
                                <p className="text-xs font-semibold text-green-600">
                                    ₹{(result.totalRevenue / 10000000).toFixed(2)}Cr
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground">Net Profit</p>
                                <p className="text-xs font-semibold text-green-600">
                                    +₹{(result.profit / 100000).toFixed(2)}L
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
