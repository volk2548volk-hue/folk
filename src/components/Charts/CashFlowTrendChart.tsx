import React, { useState, useMemo } from 'react';
import { Transaction } from '../../types/finance';
import { formatCurrency, THAI_MONTHS_SHORT } from '../../constants/categories';
import { BarChart3, Calendar, LineChart } from 'lucide-react';

interface CashFlowTrendChartProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
  allTransactions: Transaction[];
}

export const CashFlowTrendChart: React.FC<CashFlowTrendChartProps> = ({
  transactions,
  selectedMonth,
  allTransactions,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Compute Daily data for selectedMonth
  const dailyData = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const dayNum = i + 1;
      const dayFormatted = String(dayNum).padStart(2, '0');
      const dateKey = `${selectedMonth}-${dayFormatted}`;
      return {
        label: `${dayNum}`,
        fullDate: dateKey,
        income: 0,
        expense: 0,
      };
    });

    transactions.forEach((tx) => {
      if (tx.date.startsWith(selectedMonth)) {
        const dayPart = parseInt(tx.date.split('-')[2], 10);
        if (dayPart >= 1 && dayPart <= daysInMonth) {
          if (tx.type === 'income') {
            days[dayPart - 1].income += tx.amount;
          } else if (tx.type === 'expense') {
            days[dayPart - 1].expense += tx.amount;
          }
        }
      }
    });

    return days;
  }, [transactions, selectedMonth]);

  // Compute 6-Month trend data
  const monthlyData = useMemo(() => {
    const [currYear, currMonth] = selectedMonth.split('-').map(Number);
    const months: { label: string; yearMonth: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(currYear, currMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const ym = `${y}-${String(m).padStart(2, '0')}`;
      const label = `${THAI_MONTHS_SHORT[m - 1]} ${y + 543}`;
      months.push({ label, yearMonth: ym, income: 0, expense: 0 });
    }

    allTransactions.forEach((tx) => {
      const txYM = tx.date.substring(0, 7);
      const match = months.find((m) => m.yearMonth === txYM);
      if (match) {
        if (tx.type === 'income') {
          match.income += tx.amount;
        } else if (tx.type === 'expense') {
          match.expense += tx.amount;
        }
      }
    });

    return months;
  }, [allTransactions, selectedMonth]);

  const activeDataset = viewMode === 'daily' ? dailyData : monthlyData;

  const maxVal = useMemo(() => {
    const max = Math.max(
      ...activeDataset.map((d) => Math.max(d.income, d.expense)),
      1000
    );
    return max * 1.15; // 15% headroom
  }, [activeDataset]);

  const chartHeight = 180;
  const chartWidth = 500;
  const barPadding = viewMode === 'daily' ? 3 : 16;
  const groupWidth = chartWidth / activeDataset.length;
  const singleBarWidth = Math.max(
    viewMode === 'daily' ? (groupWidth - barPadding * 2) / 2 : 16,
    2
  );

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">เปรียบเทียบกระแสเงินสด (Cash Flow)</h3>
            <p className="text-xs text-slate-400">เปรียบเทียบรายรับและรายจ่ายในแต่ละช่วงเวลา</p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
          <button
            onClick={() => setViewMode('daily')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'daily'
                ? 'bg-white text-slate-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            รายวันในเดือนนี้
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'monthly'
                ? 'bg-white text-slate-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            ย้อนหลัง 6 เดือน
          </button>
        </div>
      </div>

      {/* Legend & Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
            <span className="font-medium text-slate-700">รายรับ (Income)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block"></span>
            <span className="font-medium text-slate-700">รายจ่าย (Expense)</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          ยอดสูงสุด: {formatCurrency(maxVal)}
        </span>
      </div>

      {/* SVG Bar Chart Area */}
      <div className="flex-1 relative w-full flex flex-col justify-end min-h-[220px]">
        {/* Tooltip on hover */}
        {hoveredIndex !== null && activeDataset[hoveredIndex] && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-xs text-white px-3.5 py-2 rounded-xl text-xs shadow-xl z-20 pointer-events-none flex items-center gap-4">
            <span className="font-semibold text-slate-200">
              {viewMode === 'daily'
                ? `วันที่ ${activeDataset[hoveredIndex].label}`
                : activeDataset[hoveredIndex].label}
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-400 font-medium">
                +{formatCurrency(activeDataset[hoveredIndex].income)}
              </span>
              <span className="text-rose-400 font-medium">
                -{formatCurrency(activeDataset[hoveredIndex].expense)}
              </span>
              <span className="text-slate-300 font-semibold border-l border-slate-700 pl-2">
                สุทธิ:{' '}
                {formatCurrency(
                  activeDataset[hoveredIndex].income -
                    activeDataset[hoveredIndex].expense
                )}
              </span>
            </div>
          </div>
        )}

        {/* SVG Graphic */}
        <div className="w-full h-48 relative">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            preserveAspectRatio="none"
            className="w-full h-full overflow-visible"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = chartHeight - pct * (chartHeight - 20);
              return (
                <line
                  key={idx}
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray={pct > 0 && pct < 1 ? '4 4' : undefined}
                />
              );
            })}

            {/* Bars */}
            {activeDataset.map((item, idx) => {
              const groupX = idx * groupWidth;
              const incH = Math.max((item.income / maxVal) * (chartHeight - 20), 0);
              const expH = Math.max((item.expense / maxVal) * (chartHeight - 20), 0);

              const incX = groupX + groupWidth / 2 - singleBarWidth - 1;
              const expX = groupX + groupWidth / 2 + 1;
              const incY = chartHeight - incH;
              const expY = chartHeight - expH;

              const isHovered = hoveredIndex === idx;

              return (
                <g
                  key={idx}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="cursor-pointer transition-opacity"
                  opacity={hoveredIndex !== null && !isHovered ? 0.4 : 1}
                >
                  {/* Invisible hit area for comfortable hover */}
                  <rect
                    x={groupX}
                    y="0"
                    width={groupWidth}
                    height={chartHeight}
                    fill="transparent"
                  />

                  {/* Income Bar */}
                  {incH > 0 && (
                    <rect
                      x={incX}
                      y={incY}
                      width={singleBarWidth}
                      height={incH}
                      rx="3"
                      fill="#10B981"
                      className="transition-all duration-150"
                    />
                  )}

                  {/* Expense Bar */}
                  {expH > 0 && (
                    <rect
                      x={expX}
                      y={expY}
                      width={singleBarWidth}
                      height={expH}
                      rx="3"
                      fill="#F43F5E"
                      className="transition-all duration-150"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* X Axis Labels */}
        <div className="flex justify-between w-full mt-2 text-[10px] text-slate-400 font-mono">
          {viewMode === 'daily' ? (
            <>
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>{activeDataset.length}</span>
            </>
          ) : (
            activeDataset.map((d, i) => (
              <span key={i} className="truncate max-w-[50px] text-center">
                {d.label.split(' ')[0]}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
