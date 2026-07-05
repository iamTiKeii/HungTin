import React from "react";
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
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();

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
      path: "/cash",
      label: "Quản Lý Quỹ Két",
      icon: Wallet,
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
      // Visible if user has any contract access
    },
  ];

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 text-slate-300 min-h-screen flex flex-col justify-between py-6">
      <div className="px-4">
        <p className="text-xs uppercase tracking-wider text-slate-500 font-bold px-3 mb-4">Điều hướng chính</p>
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
                  className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                      : "hover:bg-slate-800/60 hover:text-slate-100"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-slate-950" : "text-slate-400 group-hover:text-slate-100"}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="px-6 text-center text-xs text-slate-600 font-semibold">
        <p>PawnManager V2</p>
        <p className="mt-0.5">Build by Antigravity</p>
      </div>
    </div>
  );
};
