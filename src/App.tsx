import React, { useState } from "react";
import { PlanningProvider, usePlanning } from "./context/PlanningContext";
import { Header } from "./components/common/Header";
import { Navigation } from "./components/common/Navigation";
import { AuditLogModal } from "./components/common/AuditLogModal";
import { NotificationDrawer } from "./components/common/NotificationDrawer";

// Epic Views
import { MonthlyDashboard } from "./components/dashboard/MonthlyDashboard";
import { CycleManagement } from "./components/cycles/CycleManagement";
import { HeadcountPlanning } from "./components/headcount/HeadcountPlanning";
import { PnLPlanning } from "./components/pnl/PnLPlanning";
import { CostDriverPlanning } from "./components/drivers/CostDriverPlanning";
import { AIPredictivePlanning } from "./components/forecasting/AIPredictivePlanning";
import { ScenarioWhatIf } from "./components/scenarios/ScenarioWhatIf";
import { VarianceAnalysis } from "./components/variance/VarianceAnalysis";
import { WorkflowApprovals } from "./components/workflow/WorkflowApprovals";
import { ManagementReviews } from "./components/reporting/ManagementReviews";
import { DataIntegration } from "./components/integration/DataIntegration";
import { SecurityGovernance } from "./components/governance/SecurityGovernance";

const MainLayout: React.FC = () => {
  const { activeTab } = usePlanning();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <MonthlyDashboard />;
      case "cycles":
        return <CycleManagement />;
      case "headcount":
        return <HeadcountPlanning />;
      case "pnl":
        return <PnLPlanning />;
      case "drivers":
        return <CostDriverPlanning />;
      case "forecasting":
        return <AIPredictivePlanning />;
      case "scenarios":
        return <ScenarioWhatIf />;
      case "variance":
        return <VarianceAnalysis />;
      case "workflow":
        return <WorkflowApprovals />;
      case "reporting":
        return <ManagementReviews />;
      case "integration":
        return <DataIntegration />;
      case "governance":
        return <SecurityGovernance />;
      default:
        return <MonthlyDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col selection:bg-blue-500/20 selection:text-blue-900 font-sans">
      {/* Top Application Header */}
      <Header
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
        onOpenNotifications={() => setIsNotifsOpen(true)}
      />

      {/* Main Epic Navigation Tab Bar */}
      <Navigation />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveView()}
      </main>

      {/* Global Audit Log Modal */}
      <AuditLogModal isOpen={isAuditModalOpen} onClose={() => setIsAuditModalOpen(false)} />

      {/* Global Notification Drawer */}
      <NotificationDrawer isOpen={isNotifsOpen} onClose={() => setIsNotifsOpen(false)} />

      {/* Geometric Balance System Status Footer */}
      <footer className="h-8 bg-slate-200 border-t border-slate-300 px-6 flex items-center justify-between text-[10px] font-medium text-slate-600 shrink-0">
        <div>System v4.2.1-stable | Security: Role-Based (RBAC) Enabled</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            ERP Integration Active
          </span>
          <span>Last Audit: 12.04.2024</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <PlanningProvider>
      <MainLayout />
    </PlanningProvider>
  );
}
