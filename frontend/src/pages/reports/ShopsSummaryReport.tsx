import React, { useEffect, useState } from "react";
import axios from "axios";
import { Store, Coins, TrendingUp, Award, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const ShopsSummaryReport: React.FC = () => {
  const { activeStore } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/reports/overview");
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải báo cáo chuỗi cửa hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore]);

  const formatCurrency = (val: any) => {
    return Number(val || 0).toLocaleString("vi-VN") + " đ";
  };

  // Totals
  const totalInvestment = data.reduce((sum, item) => sum + Number(item.investment_capital), 0);
  const totalCash = data.reduce((sum, item) => sum + Number(item.current_cash), 0);
  const totalPawn = data.reduce((sum, item) => sum + Number(item.pawn_lending), 0);
  const totalUnsecured = data.reduce((sum, item) => sum + Number(item.unsecured_lending), 0);
  const totalInstallment = data.reduce((sum, item) => sum + Number(item.installment_lending), 0);
  const totalLending = totalPawn + totalUnsecured + totalInstallment;
  const totalExpectedInterest = data.reduce((sum, item) => sum + Number(item.expected_interest), 0);
  const totalCollectedInterest = data.reduce((sum, item) => sum + Number(item.collected_interest), 0);

  return (
    <div className="space-y-6 p-2 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Tổng Quát Chuỗi Cửa Hàng
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Bảng thống kê toàn diện tình hình tài chính, nguồn vốn, quỹ két và dư nợ cho vay của toàn hệ thống chi nhánh.
        </p>
      </div>

      {error && (
        <div className="alert alert-error bg-red-500/10 border-red-500/20 text-red-200 shadow-lg rounded-2xl flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-amber-500/10 rounded-2xl w-fit text-amber-500 mb-4">
            <Store className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tổng Vốn Đầu Tư Hệ Thống</p>
          <h2 className="text-2xl font-black text-slate-800 mt-2">{formatCurrency(totalInvestment)}</h2>
        </div>

        <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-orange-500/10 rounded-2xl w-fit text-orange-500 mb-4">
            <Coins className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tổng Quỹ Tiền Mặt Thực Tế</p>
          <h2 className="text-2xl font-black text-slate-800 mt-2">{formatCurrency(totalCash)}</h2>
        </div>

        <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-blue-500/10 rounded-2xl w-fit text-blue-500 mb-4">
            <TrendingUp className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tổng Dư Nợ Đang Cho Vay</p>
          <h2 className="text-2xl font-black text-slate-800 mt-2">{formatCurrency(totalLending)}</h2>
        </div>

        <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-emerald-500/10 rounded-2xl w-fit text-emerald-500 mb-4">
            <Award className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tổng Lãi Lũy Kế Đã Thu</p>
          <h2 className="text-2xl font-black text-slate-800 mt-2">{formatCurrency(totalCollectedInterest)}</h2>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-500" />
            Chi Tiết Tài Chính Theo Chi Nhánh
          </h3>
          <button
            onClick={fetchData}
            className="btn btn-ghost btn-sm rounded-xl text-slate-500 hover:bg-slate-50 flex items-center gap-1.5"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-500" : ""}`} />
            Làm Mới
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg text-amber-500"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-600">
              <thead>
                <tr className="border-b border-slate-200/80/60 text-slate-500">
                  <th>Tên Chi Nhánh</th>
                  <th>Vốn Đầu Tư</th>
                  <th>Quỹ Tiền Mặt</th>
                  <th>Dư Nợ Cầm Đồ</th>
                  <th>Dư Nợ Tín Chấp</th>
                  <th>Dư Nợ Trả Góp</th>
                  <th>Lãi Dự Kiến</th>
                  <th>Lãi Đã Thu</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-b border-slate-200/40 hover:bg-slate-50/50">
                    <td className="font-bold text-slate-800">{item.name}</td>
                    <td>{formatCurrency(item.investment_capital)}</td>
                    <td className="text-emerald-400 font-semibold">{formatCurrency(item.current_cash)}</td>
                    <td>{formatCurrency(item.pawn_lending)}</td>
                    <td>{formatCurrency(item.unsecured_lending)}</td>
                    <td>{formatCurrency(item.installment_lending)}</td>
                    <td className="text-amber-500/80">{formatCurrency(item.expected_interest)}</td>
                    <td className="text-amber-600 font-semibold">{formatCurrency(item.collected_interest)}</td>
                  </tr>
                ))}
                {/* Total Row */}
                {data.length > 0 && (
                  <tr className="border-t border-slate-200 bg-white/50 font-bold text-slate-800">
                    <td>Tổng Cộng</td>
                    <td>{formatCurrency(totalInvestment)}</td>
                    <td className="text-emerald-400">{formatCurrency(totalCash)}</td>
                    <td>{formatCurrency(totalPawn)}</td>
                    <td>{formatCurrency(totalUnsecured)}</td>
                    <td>{formatCurrency(totalInstallment)}</td>
                    <td className="text-amber-500/85">{formatCurrency(totalExpectedInterest)}</td>
                    <td className="text-amber-600">{formatCurrency(totalCollectedInterest)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
