import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";

// Pages
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";

// Placeholders for views we'll implement or configure
import { Stores } from "./pages/Stores";
import { Employees } from "./pages/Employees";
import { Customers } from "./pages/Customers";
import { Collaborators } from "./pages/Collaborators";
import { Commodities } from "./pages/Commodities";
import { CashFund } from "./pages/CashFund";
import { Vouchers } from "./pages/Vouchers";
import { Contracts } from "./pages/Contracts";
import { PawnDetail } from "./pages/PawnDetail";
import { UnsecuredDetail } from "./pages/UnsecuredDetail";
import { InstallmentDetail } from "./pages/InstallmentDetail";
import { BeginningCash } from "./pages/BeginningCash";
import { CapitalContracts } from "./pages/CapitalContracts";
import { ShopsSummaryReport } from "./pages/reports/ShopsSummaryReport";
import { TransactionsSummaryReport } from "./pages/reports/TransactionsSummaryReport";
import { ProfitSummaryReport } from "./pages/reports/ProfitSummaryReport";
import { InterestDetailReport } from "./pages/reports/InterestDetailReport";
import { EmployeeCollectionReport } from "./pages/reports/EmployeeCollectionReport";
import { ContractStatusReports } from "./pages/reports/ContractStatusReports";
import { ShiftHandoverReport } from "./pages/reports/ShiftHandoverReport";
import { DailyCashFlowReport } from "./pages/reports/DailyCashFlowReport";
import { CollaboratorReport } from "./pages/reports/CollaboratorReport";

const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <span className="loading loading-spinner loading-lg text-amber-500"></span>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-70px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-100">
        <span className="loading loading-spinner loading-lg text-amber-500"></span>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateLayout>
                <Dashboard />
              </PrivateLayout>
            }
          />
          <Route
            path="/stores"
            element={
              <PrivateLayout>
                <Stores />
              </PrivateLayout>
            }
          />
          <Route
            path="/employees"
            element={
              <PrivateLayout>
                <Employees />
              </PrivateLayout>
            }
          />
          <Route
            path="/customers"
            element={
              <PrivateLayout>
                <Customers />
              </PrivateLayout>
            }
          />
          <Route
            path="/collaborators"
            element={
              <PrivateLayout>
                <Collaborators />
              </PrivateLayout>
            }
          />
          <Route
            path="/commodities"
            element={
              <PrivateLayout>
                <Commodities />
              </PrivateLayout>
            }
          />
          <Route
            path="/cash/beginning"
            element={
              <PrivateLayout>
                <BeginningCash />
              </PrivateLayout>
            }
          />
          <Route
            path="/cash"
            element={
              <PrivateLayout>
                <CashFund />
              </PrivateLayout>
            }
          />
          <Route
            path="/contracts/capital"
            element={
              <PrivateLayout>
                <CapitalContracts />
              </PrivateLayout>
            }
          />
          <Route
            path="/vouchers"
            element={
              <PrivateLayout>
                <Vouchers />
              </PrivateLayout>
            }
          />
          <Route
            path="/contracts"
            element={
              <PrivateLayout>
                <Contracts />
              </PrivateLayout>
            }
          />
          <Route
            path="/contracts/pawn/:id"
            element={
              <PrivateLayout>
                <PawnDetail />
              </PrivateLayout>
            }
          />
          <Route
            path="/contracts/unsecured/:id"
            element={
              <PrivateLayout>
                <UnsecuredDetail />
              </PrivateLayout>
            }
          />
          <Route
            path="/contracts/installment/:id"
            element={
              <PrivateLayout>
                <InstallmentDetail />
              </PrivateLayout>
            }
          />
          {/* Reports Routes */}
          <Route
            path="/reports/overview"
            element={
              <PrivateLayout>
                <ShopsSummaryReport />
              </PrivateLayout>
            }
          />
          <Route
            path="/reports/transactions"
            element={
              <PrivateLayout>
                <TransactionsSummaryReport />
              </PrivateLayout>
            }
          />
          <Route
            path="/reports/profit"
            element={
              <PrivateLayout>
                <ProfitSummaryReport />
              </PrivateLayout>
            }
          />
          <Route
            path="/reports/interest"
            element={
              <PrivateLayout>
                <InterestDetailReport />
              </PrivateLayout>
            }
          />
          <Route
            path="/reports/collection"
            element={
              <PrivateLayout>
                <EmployeeCollectionReport />
              </PrivateLayout>
            }
          />
          <Route
            path="/reports/contracts/:category"
            element={
              <PrivateLayout>
                <ContractStatusReports />
              </PrivateLayout>
            }
          />
          <Route
            path="/reports/shift-handover"
            element={
              <PrivateLayout>
                <ShiftHandoverReport />
              </PrivateLayout>
            }
          />
          <Route
            path="/reports/cashflow"
            element={
              <PrivateLayout>
                <DailyCashFlowReport />
              </PrivateLayout>
            }
          />
          <Route
            path="/reports/collaborators"
            element={
              <PrivateLayout>
                <CollaboratorReport />
              </PrivateLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
