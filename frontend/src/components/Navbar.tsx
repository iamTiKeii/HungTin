import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth, type StoreInfo } from "../context/AuthContext";
import { Shield, Home, LogOut, ChevronDown } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, activeStore, switchStore, logout, hasPermission } = useAuth();
  const [stores, setStores] = useState<StoreInfo[]>([]);

  useEffect(() => {
    if (hasPermission("STORES_MANAGE")) {
      axios.get("/api/stores").then((res) => {
        setStores(res.data.filter((s: any) => s.status === "active"));
      }).catch(err => console.error("Error loading stores in navbar", err));
    }
  }, [user]);

  return (
    <div className="navbar bg-white border-b border-slate-200/80 px-6 py-3 text-slate-800 flex justify-between items-center shadow-md">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-amber-500 animate-pulse" />
        <div>
          <span className="text-xl font-extrabold tracking-wider text-amber-500">PawnManager</span>
          <span className="text-xs font-semibold block text-slate-500">Hệ Thống Quản Lý Chuỗi Cửa Hàng V2</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Active Store Indicator / Swapper */}
        {hasPermission("STORES_MANAGE") && stores.length > 0 ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline border-amber-500/50 hover:border-amber-500 hover:bg-slate-50 text-slate-700 btn-sm gap-2">
              <Home className="w-4 h-4 text-amber-500" />
              <span>{activeStore?.name}</span>
              <ChevronDown className="w-4 h-4" />
            </label>
            <ul tabIndex={0} className="dropdown-content z-[10] menu p-2 shadow-2xl bg-slate-50 border border-slate-200 rounded-box w-56 mt-2">
              <li className="menu-title text-slate-500 text-xs px-2 py-1">Chọn chi nhánh làm việc</li>
              {stores.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => switchStore(s)}
                    className={`flex items-center justify-between py-2 ${
                      activeStore?.id === s.id ? "bg-amber-500/10 text-amber-500 font-bold" : "hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span>{s.name}</span>
                    {activeStore?.id === s.id && <span className="badge badge-amber badge-xs">Active</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-50/80 px-3 py-1.5 rounded-lg border border-slate-200">
            <Home className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-700">{activeStore?.name}</span>
          </div>
        )}

        {/* Profile Card & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{user?.full_name}</p>
            <p className="text-xs text-slate-500 font-semibold">{user?.username} (Giao dịch viên)</p>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar bg-slate-50 border border-slate-200">
              <div className="w-10 rounded-full flex items-center justify-center font-bold text-amber-500 text-lg">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[10] p-2 shadow-xl bg-slate-50 border border-slate-200 rounded-box w-52">
              <li>
                <div className="px-4 py-2 border-b border-slate-200 text-slate-600 pointer-events-none">
                  <p className="text-xs text-slate-500">Đang hoạt động tại</p>
                  <p className="font-semibold text-slate-700 mt-0.5">{user?.store.name}</p>
                </div>
              </li>
              <li>
                <button onClick={logout} className="text-red-400 hover:bg-red-500/10 py-2.5 mt-1 font-semibold gap-2">
                  <LogOut className="w-4 h-4" />
                  Đăng xuất hệ thống
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
