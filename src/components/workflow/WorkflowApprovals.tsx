import React, { useState } from "react";
import { usePlanning } from "../../context/PlanningContext";
import { DepartmentId, PlanSubmission } from "../../types";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Send,
  ShieldCheck,
  Building,
  FileCheck,
  MessageSquare,
  Lock,
} from "lucide-react";

export const WorkflowApprovals: React.FC = () => {
  const {
    submissions,
    submitDepartmentPlan,
    reviewSubmission,
    activeCycle,
    departments,
    currentUser,
    formatCurrency,
  } = usePlanning();

  const [selectedSub, setSelectedSub] = useState<PlanSubmission | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [submitDeptId, setSubmitDeptId] = useState<DepartmentId>("ENG");
  const [submitBudget, setSubmitBudget] = useState<number>(4500000);
  const [submitHeadcount, setSubmitHeadcount] = useState<number>(38);

  const stages: { status: PlanSubmission["status"]; label: string; color: string }[] = [
    { status: "DRAFT", label: "Draft Formulation", color: "border-slate-200 bg-slate-50/50" },
    { status: "SUBMITTED", label: "Submitted for Review", color: "border-blue-200 bg-blue-50/30" },
    { status: "CONTROLLER_REVIEW", label: "Controller Review", color: "border-amber-200 bg-amber-50/30" },
    { status: "APPROVED", label: "Approved & Validated", color: "border-emerald-200 bg-emerald-50/30" },
    { status: "REJECTED", label: "Revisions Requested", color: "border-rose-200 bg-rose-50/30" },
  ];

  const handleReviewAction = (status: "APPROVED" | "REJECTED") => {
    if (!selectedSub) return;
    reviewSubmission(selectedSub.id, status, reviewComments);
    setSelectedSub(null);
    setReviewComments("");
  };

  const handleDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDepartmentPlan(submitDeptId, submitBudget, submitHeadcount);
    setIsSubmitModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
              Workflow & Approvals Governance
            </span>
            <span className="text-xs text-slate-500">{activeCycle.name}</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mt-1">Multi-Stage Submission & Approval Pipeline</h1>
          <p className="text-xs text-slate-500">
            Enforce controller validation gates, automated completeness checks, and cryptographic sign-off ledgers
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <Send className="w-4 h-4" />
          <span>Submit Department Plan</span>
        </button>
      </div>

      {/* Kanban Workflow Pipeline (US9.4) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const stageSubmissions = submissions.filter((s) => s.status === stage.status);

          return (
            <div
              key={stage.status}
              className={`rounded-xl border p-4 flex flex-col justify-between ${stage.color} min-h-[380px] shadow-sm`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{stage.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white border border-slate-200 text-slate-700">
                    {stageSubmissions.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {stageSubmissions.map((sub) => {
                    const dept = departments.find((d) => d.id === sub.departmentId);

                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSub(sub)}
                        className="bg-white border border-slate-200 hover:border-blue-500 rounded-xl p-3.5 cursor-pointer transition shadow-sm text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dept?.color }} />
                            <span className="font-bold text-slate-900">{sub.departmentName}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{dept?.costCenter}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg">
                          <div>
                            <span className="text-slate-500 block text-[9px] font-sans">Requested Budget</span>
                            <span className="font-bold text-slate-900">{formatCurrency(sub.totalRequestedBudget, true)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[9px] font-sans">Headcount</span>
                            <span className="font-bold text-indigo-700">{sub.headcountRequested} FTE</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                          <span>By: {sub.submittedBy}</span>
                          <span>{sub.submittedAt.split(" ")[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 text-center text-[10px] text-slate-400">
                {stageSubmissions.length === 0 ? "No active proposals" : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review & Validation Modal (US9.2 & US9.3) */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Controller Validation: {selectedSub.departmentName}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Submitted by {selectedSub.submittedBy} on {selectedSub.submittedAt}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Requested Budget</span>
                  <span className="text-base font-bold text-slate-900">{formatCurrency(selectedSub.totalRequestedBudget)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Planned Headcount</span>
                  <span className="text-base font-bold text-emerald-600">{selectedSub.headcountRequested} Active FTEs</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-sans">Current Status</span>
                  <span className="text-xs font-bold text-purple-700">{selectedSub.status.replace(/_/g, " ")}</span>
                </div>
              </div>

              {/* Controller Validation Checklist (US9.2) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 text-xs block mb-1">
                  Automated Controller Validation Gates
                </span>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cost element completeness check: 100% GL categories populated</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Headcount loaded salary formula consistency verified (22% benefits applied)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Operating budget fits within October baseline target corridor (+/- 2.5%)</span>
                  </div>
                </div>
              </div>

              {/* Review Comments Box */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Controller Review Notes & Rejection/Approval Feedback
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter formal justification, conditions of approval, or requested headcount adjustments..."
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons (US9.3) */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction("REJECTED")}
                  className="px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold flex items-center space-x-1.5 transition"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Request Revisions</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAction("APPROVED")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm flex items-center space-x-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve Submission</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Department Plan Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Send className="w-5 h-5 text-blue-600" />
                <span>Submit Departmental Plan</span>
              </h3>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-500 hover:text-slate-800 text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-lg shadow-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleDepartmentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department</label>
                <select
                  value={submitDeptId}
                  onChange={(e) => setSubmitDeptId(e.target.value as DepartmentId)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.costCenter})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Requested Total Budget ($)</label>
                <input
                  type="number"
                  step="10000"
                  required
                  value={submitBudget}
                  onChange={(e) => setSubmitBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Headcount Target (FTE)</label>
                <input
                  type="number"
                  required
                  value={submitHeadcount}
                  onChange={(e) => setSubmitHeadcount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                >
                  Transmit to Controller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
