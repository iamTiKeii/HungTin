import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Store,
  Users,
  UserCheck,
  Package,
  Wallet,
  Receipt,
  FileText,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Coins,
  Briefcase,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [reportsOpen, setReportsOpen] = useState(
    location.pathname.startsWith("/reports")
  );

  const menuItems = [
    {
      path: "/",
      label: "Bảng Điều Khiển",
      icon: LayoutDashboard,
    },
    {
      path: "/stores",
      label: "Chi Nhánh Cửa Hàng",
      icon: Store,
      permission: "STORES_MANAGE",
    },
    {
      path: "/employees",
      label: "Nhân Viên & Quyền",
      icon: Users,
      permission: "EMPLOYEES_MANAGE",
    },
    {
      path: "/customers",
      label: "Hồ Sơ Khách Hàng",
      icon: UserCheck,
      permission: "CUSTOMERS_MANAGE",
    },
    {
      path: "/collaborators",
      label: "Cộng Tác Viên",
      icon: Users,
      permission: "COLLABORATORS_MANAGE",
    },
    {
      path: "/commodities",
      label: "Cấu Hình Hàng Hóa",
      icon: Package,
      permission: "COMMODITIES_MANAGE",
    },
    {
      path: "/cash/beginning",
      label: "Nhập Quỹ Đầu Ngày",
      icon: Coins,
      permission: "FUNDS_MANAGE",
    },
    {
      path: "/cash",
      label: "Quản Lý Quỹ Két",
      icon: Wallet,
      permission: "FUNDS_MANAGE",
    },
    {
      path: "/contracts/capital",
      label: "Nguồn Vốn Đầu Tư",
      icon: Briefcase,
      permission: "FUNDS_MANAGE",
    },
    {
      path: "/vouchers",
      label: "Phiếu Thu / Chi",
      icon: Receipt,
      permission: "VOUCHERS_MANAGE",
    },
    {
      path: "/contracts",
      label: "Hợp Đồng Tín Dụng",
      icon: FileText,
    },
  ];

  const reportSubItems = [
    { path: "/reports/overview", label: "Tổng quát các cửa hàng", permission: "STORES_MANAGE" },
    { path: "/reports/transactions", label: "Tổng kết giao dịch" },
    { path: "/reports/profit", label: "Tổng kết lợi nhuận" },
    { path: "/reports/interest", label: "Chi tiết tiền lãi" },
    { path: "/reports/collection", label: "Thống kê thu tiền" },
    { path: "/reports/contracts/active-loans", label: "Hợp đồng đang vay" },
    { path: "/reports/contracts/waiting-liquidation", label: "Hợp đồng chờ thanh lý" },
    { path: "/reports/contracts/redeemed", label: "Hợp đồng tất toán" },
    { path: "/reports/contracts/liquidated", label: "Hợp đồng đã thanh lý" },
    { path: "/reports/contracts/cancelled", label: "Hợp đồng đã xóa" },
    { path: "/reports/shift-handover", label: "Bàn giao ca" },
    { path: "/reports/cashflow", label: "Dòng tiền theo ngày" },
    { path: "/reports/collaborators", label: "Cộng tác viên" },
  ];

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-900 text-slate-300 min-h-screen flex flex-col justify-between py-6 select-none shrink-0 overflow-y-auto max-h-[calc(100vh-70px)]">
      <div className="px-4">
        <p className="text-xs uppercase tracking-wider text-slate-600 font-bold px-3 mb-4">Điều hướng chính</p>
        <ul className="space-y-1">
          {menuItems.map((item) => {
            if (item.permission && !hasPermission(item.permission)) {
              return null;
            }

            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/10"
                      : "hover:bg-slate-900 hover:text-slate-100"
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}

          {/* Collapsible Reports Menu Item */}
          <li>
            <button
              onClick={() => setReportsOpen(!reportsOpen)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith("/reports")
                  ? "bg-slate-900 text-amber-500 font-semibold"
                  : "hover:bg-slate-900 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <BarChart3 className={`w-4.5 h-4.5 ${location.pathname.startsWith("/reports") ? "text-amber-500" : "text-slate-400"}`} />
                <span>Báo Cáo Thống Kê</span>
              </div>
              {reportsOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {reportsOpen && (
              <ul className="mt-1 ml-4 border-l border-slate-800/80 pl-3 space-y-1">
                {reportSubItems.map((subItem) => {
                  if (subItem.permission && !hasPermission(subItem.permission)) {
                    return null;
                  }
                  const isSubActive = location.pathname === subItem.path;
                  return (
                    <li key={subItem.path}>
                      <Link
                        to={subItem.path}
                        className={`block py-2 px-3 text-xs rounded-lg transition-all duration-200 ${
                          isSubActive
                            ? "text-amber-400 font-semibold bg-amber-500/5"
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/50"
                        }`}
                      >
                        {subItem.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        </ul>
      </div>

      <div className="px-6 text-center text-xs text-slate-700 font-medium pt-6 mt-6 border-t border-slate-900/60">
        <p>PawnManager V2</p>
        <p className="mt-0.5 text-slate-800">Build by Antigravity</p>
      </div>
    </div>
  );
};
