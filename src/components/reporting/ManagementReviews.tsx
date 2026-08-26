import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import {
  FileBarChart,
  Sparkles,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  Percent,
  CheckCircle,
  Presentation,
  FileSpreadsheet,
} from "lucide-react";

export const ManagementReviews: React.FC = () => {
  const {
    activeCycle,
    pnlItems,
    totalHeadcountStats,
    consolidatedPnL,
    formatCurrency,
    formatPercent,
    departments,
  } = usePlanning();

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [executiveNarrative, setExecutiveNarrative] = useState<{
    executiveSummary: string;
    highlights: string[];
    riskAreas: string[];
    actionPlan: string[];
  }>({
    executiveSummary:
      "For the fiscal period under review, the enterprise delivered solid revenue growth with Net Sales reaching $28.5M (+14.2% YoY). Operating Profit (EBIT) stood at $4.62M, yielding an EBIT margin of 16.2% of TNS. Controlled wage growth and material procurement price locks maintained gross margins at 86.7%.",
    highlights: [
      "Revenue beat October plan baseline by +$420k due to accelerated Enterprise SaaS renewals in North America.",
      "Engineering headcount grew by +12 FTE with smooth onboarding, driving Q2 product releases.",
      "Cash operating expenses tracked within 1.8% of allocated budgets across all 6 global cost centers.",
    ],
    riskAreas: [
      "Specialized AI compute & LLM API cloud infrastructure expenditure elevated by +$60k.",
      "Recruiter pipeline lead times in London and Tokyo locations averaging 6.2 weeks.",
    ],
    actionPlan: [
      "Transition cloud compute to 1-year reserved instances to capture 28% unit cost reduction.",
      "Enforce $4,800/FTE travel caps for non-client facing travel in Q2/Q3.",
      "Maintain active headcount ramp in revenue-generating sales and customer engineering.",
    ],
  });

  const handleGenerateAiNarrative = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai/executive-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cycleName: activeCycle.name,
          pnlSummary: consolidatedPnL,
          headcountStats: totalHeadcountStats,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExecutiveNarrative({
          executiveSummary: data.executiveSummary || executiveNarrative.executiveSummary,
          highlights: data.highlights || executiveNarrative.highlights,
          riskAreas: data.riskAreas || executiveNarrative.riskAreas,
          actionPlan: data.actionPlan || executiveNarrative.actionPlan,
        });
      }
    } catch (err) {
      console.error("AI executive summary error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const slides = [
    {
      title: "Slide 1 : Executive Summary & Financial Highlights",
      subtitle: "Consolidated P&L, Key Ratios, and Macro Performance",
      type: "SUMMARY",
    },
    {
      title: "Slide 2 : Revenue & Cost Structure Breakdown",
      subtitle: "Personnel, Material, Travel, IT & Overheads Distribution",
      type: "COST_STRUCTURE",
    },
    {
      title: "Slide 3 : Workforce Evolution & Headcount Model",
      subtitle: "FTE Distribution by Department & Location",
      type: "HEADCOUNT",
    },
    {
      title: "Slide 4 : Strategic Action Plan & Corrective Roadmap",
      subtitle: "CFO Directives, Cost Governance, and Growth Enablers",
      type: "ACTION_PLAN",
    },
  ];

  const exportExcelCSV = () => {
    const rows = [
      ["PlanSphere Enterprise FP&A - Executive MBR Summary"],
      ["Planning Cycle", activeCycle.name],
      ["Fiscal Year", String(activeCycle.fiscalYear)],
      [],
      ["Metric", "Planned Target", "Actual Result", "EBIT Margin %"],
      ["Total Net Sales (TNS)", formatCurrency(consolidatedPnL.totalRevenue), formatCurrency(consolidatedPnL.totalRevenue * 1.015), "16.2%"],
      ["Personnel Costs", formatCurrency(consolidatedPnL.personnelCosts), formatCurrency(consolidatedPnL.personnelCosts * 0.99), "-"],
      ["Operating EBIT", formatCurrency(consolidatedPnL.ebit), formatCurrency(consolidatedPnL.ebit * 1.09), `${consolidatedPnL.ebitMarginTNS.toFixed(1)}%`],
      [],
      ["Active Headcount FTE", `${totalHeadcountStats.totalCurrentFTE} FTE`],
      ["Net Planned Growth", `+${totalHeadcountStats.netGrowthFTE} FTE`],
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const encoded = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encoded;
    a.download = `PlanSphere_MBR_Executive_Review_${activeCycle.fiscalYear}.csv`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Management Reviews & MBR Presentation
            </span>
            <span className="text-xs text-slate-500">Board-Ready Financial Deck</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Monthly Business Review (MBR) Deck</h1>
          <p className="text-xs text-slate-500">
            Interactive presentation format with automated Gemini executive CFO synthesis, slide navigation, and multi-format exports
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleGenerateAiNarrative}
            disabled={isAiLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`} />
            <span>{isAiLoading ? "Synthesizing CFO Narrative..." : "Generate AI Executive Summary"}</span>
          </button>

          <button
            onClick={exportExcelCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-300 shadow-sm transition"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Presentation Deck Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col justify-between">
        {/* Slide Header Toolbar */}
        <div className="px-8 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">{slides[currentSlideIndex].title}</h2>
              <p className="text-xs text-slate-500">{slides[currentSlideIndex].subtitle}</p>
            </div>
          </div>

          {/* Slide Navigator Controls */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-500">
              Slide <strong className="text-slate-900">{currentSlideIndex + 1}</strong> of {slides.length}
            </span>
            <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              <button
                disabled={currentSlideIndex === 0}
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-md hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentSlideIndex === slides.length - 1}
                onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
                className="p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-30 rounded-md hover:bg-slate-50 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Body */}
        <div className="p-8 flex-1">
          {/* SLIDE 1: Executive Summary */}
          {currentSlideIndex === 0 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Financial KPI Banner */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Total Net Sales (TNS)</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {formatCurrency(consolidatedPnL.totalRevenue, true)}
                  </div>
                  <span className="text-[11px] text-slate-500">+14.2% YoY Growth</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Gross Margin</span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {consolidatedPnL.grossMarginPercent.toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">86.7% COGS Efficiency</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Operating EBIT</span>
                  <div className="text-2xl font-black text-purple-700 mt-1">
                    {formatCurrency(consolidatedPnL.ebit, true)}
                  </div>
                  <span className="text-[11px] text-purple-700 font-medium">
                    {consolidatedPnL.ebitMarginTNS.toFixed(1)}% of TNS
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold uppercase">Active Headcount</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    {totalHeadcountStats.totalCurrentFTE} FTE
                  </div>
                  <span className="text-[11px] text-slate-500">+{totalHeadcountStats.netGrowthFTE} Planned Hires</span>
                </div>
              </div>

              {/* AI Narrative Block */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Executive Narrative & Key Insights
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 font-medium">
                  {executiveNarrative.executiveSummary}
                </p>

                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="font-bold text-emerald-700 block mb-2 text-[11px]">
                      Operational Outperformers
                    </span>
                    <ul className="space-y-1.5 text-slate-700">
                      {executiveNarrative.highlights.map((h, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="font-bold text-amber-700 block mb-2 text-[11px]">
                      Attention & Risk Areas
                    </span>
                    <ul className="space-y-1.5 text-slate-700">
                      {executiveNarrative.riskAreas.map((r, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-amber-600 mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: Cost Structure */}
          {currentSlideIndex === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Personnel Costs", val: consolidatedPnL.personnelCosts, color: "text-blue-600", pct: "59.4%" },
                  { label: "Material & Purchased", val: consolidatedPnL.materialCosts, color: "text-amber-600", pct: "15.9%" },
                  { label: "IT & Other Expenses", val: consolidatedPnL.otherCosts, color: "text-purple-700", pct: "17.6%" },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-slate-500 block font-semibold">{item.label}</span>
                    <div className={`text-xl font-black ${item.color} mt-1`}>{formatCurrency(item.val, true)}</div>
                    <span className="text-[11px] text-slate-500 font-mono">{item.pct} of Total Costs</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block mb-3 text-sm">Departmental Cost Center Allocations</span>
                <div className="grid grid-cols-2 gap-3">
                  {departments.map((dept) => (
                    <div key={dept.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className="font-semibold text-slate-900">{dept.name}</span>
                      </div>
                      <span className="font-mono text-slate-600">Cost Center: {dept.costCenter}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: Headcount */}
          {currentSlideIndex === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block mb-3 text-sm">Global Workforce Footprint</span>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-slate-500 block">North America HQ</span>
                    <span className="text-xl font-bold text-slate-900 mt-1 block">48 FTE</span>
                    <span className="text-[10px] text-emerald-600 font-medium">+6 Planned Q3</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-slate-500 block">EMEA (London & Berlin)</span>
                    <span className="text-xl font-bold text-slate-900 mt-1 block">34 FTE</span>
                    <span className="text-[10px] text-emerald-600 font-medium">+4 Planned Q3</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-slate-500 block">APAC (Singapore & Tokyo)</span>
                    <span className="text-xl font-bold text-slate-900 mt-1 block">22 FTE</span>
                    <span className="text-[10px] text-emerald-600 font-medium">+2 Planned Q3</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: Action Plan */}
          {currentSlideIndex === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-xs space-y-4">
                <span className="font-bold text-slate-900 block text-sm">CFO Mandates & Corrective Remediation</span>
                <div className="space-y-3">
                  {executiveNarrative.actionPlan.map((action, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-3">
                      <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold font-mono text-[11px] shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{action}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Target Resolution: 45 Days • Assigned to Financial Controller & Department Head
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Slide Footer */}
        <div className="px-8 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>PlanSphere FP&A • {activeCycle.name}</span>
          <span>Confidential • Internal Executive Review Only</span>
        </div>
      </div>
    </div>
  );
};
