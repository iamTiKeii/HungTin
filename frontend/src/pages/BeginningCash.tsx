import React, { useEffect, useState } from "react";
import axios from "axios";
import { Coins, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const BeginningCash: React.FC = () => {
  const { activeStore } = useAuth();
  const [beginningCashInput, setBeginningCashInput] = useState("");
  const [currentSummary, setCurrentSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSummary = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/cash/summary");
      setCurrentSummary(res.data);
      if (res.data) {
        setBeginningCashInput(Number(res.data.beginning_cash).toString());
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải thông tin quỹ đầu ngày.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [activeStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!beginningCashInput || Number(beginningCashInput) < 0) {
      setError("Số tiền đầu ngày không hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/cash/beginning", {
        beginning_cash: Number(beginningCashInput),
      });
      setSuccess("Thiết lập số dư quỹ đầu ngày thành công!");
      setCurrentSummary(res.data.daily_cash);
      fetchSummary();
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi lưu số dư đầu ngày.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: any) => {
    if (val === undefined || val === null) return "0";
    return Number(val).toLocaleString("vi-VN") + " VNĐ";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-2">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Nhập Tiền Quỹ Đầu Ngày
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Thiết lập số tiền quỹ két ban đầu khi bắt đầu ca làm việc của chi nhánh ngày hôm nay.
        </p>
      </div>

      {error && (
        <div className="alert alert-error bg-red-500/10 border-red-500/20 text-red-200 shadow-lg rounded-2xl flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success bg-emerald-500/10 border-emerald-500/20 text-emerald-200 shadow-lg rounded-2xl flex gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card 1 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-amber-500/10 rounded-2xl w-fit text-amber-500 mb-4">
            <Coins className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Tiền Đầu Ngày Hôm Nay</p>
          <h2 className="text-2xl font-bold text-slate-100 mt-2">
            {currentSummary ? formatCurrency(currentSummary.beginning_cash) : "Chưa thiết lập"}
          </h2>
          <p className="text-slate-500 text-xs mt-1">Sử dụng để bàn giao ca chốt số liệu</p>
        </div>

        {/* Info Card 2 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-orange-500/10 rounded-2xl w-fit text-orange-500 mb-4">
            <Coins className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Số Dư Quỹ Hiện Tại</p>
          <h2 className="text-2xl font-bold text-slate-100 mt-2">
            {currentSummary ? formatCurrency(currentSummary.current_cash) : "0 VNĐ"}
          </h2>
          <p className="text-slate-500 text-xs mt-1">Biến động thời gian thực theo thu chi</p>
        </div>

        {/* Info Card 3 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-blue-500/10 rounded-2xl w-fit text-blue-500 mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Ngày Ghi Nhận</p>
          <h2 className="text-2xl font-bold text-slate-100 mt-2">
            {new Date().toLocaleDateString("vi-VN")}
          </h2>
          <p className="text-slate-500 text-xs mt-1">Mỗi ngày cần cập nhật một lần</p>
        </div>
      </div>

      {/* Main Set Form */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-lg">
        <h3 className="text-lg font-bold text-slate-100 mb-6 flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-500" />
          Thiết lập Số Dư Đầu Ngày
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text text-slate-400 font-semibold">Nhập Số Tiền (VNĐ):</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={beginningCashInput}
                onChange={(e) => setBeginningCashInput(e.target.value)}
                placeholder="Nhập số tiền mặt đầu ngày"
                className="input input-bordered w-full rounded-2xl bg-slate-950 border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 pl-4 text-slate-100 font-bold"
                disabled={loading}
              />
            </div>
            <span className="text-xs text-slate-500 mt-2">
              Lưu ý: Nếu thay đổi tiền đầu ngày, tiền quỹ két cuối ngày sẽ tự động tăng/giảm một khoảng chênh lệch tương ứng.
            </span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="btn btn-warning bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none px-8 rounded-2xl shadow-lg shadow-amber-500/20"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Xác Nhận Thiết Lập"}
            </button>
            <button
              type="button"
              onClick={fetchSummary}
              className="btn btn-outline border-slate-800 hover:bg-slate-900 rounded-2xl text-slate-300 font-semibold"
              disabled={loading}
            >
              Làm Mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
