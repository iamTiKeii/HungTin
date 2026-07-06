import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, RefreshCw, AlertCircle, DollarSign } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const InterestDetailReport: React.FC = () => {
  const { activeStore } = useAuth();
  
  const [year, setYear] = useState(new Date().getFullYear());
  const [chartData, setChartData] = useState<any[]>([]);
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");

      // 1. Fetch Monthly Summary Chart Data
      const summaryRes = await axios.get(`/api/reports/interest?type=summary&year=${year}`);
      setChartData(summaryRes.data);

      // 2. Fetch Detail Ledger
      const detailsRes = await axios.get("/api/reports/interest");
      setDetails(detailsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải báo cáo chi tiết tiền lãi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeStore, year]);

  const formatCurrency = (val: any) => {
    return Number(val || 0).toLocaleString("vi-VN") + " đ";
  };

  // Find max value in chartData to scale bars
  const maxMonthValue = chartData.reduce((max, item) => Math.max(max, Number(item.amount)), 1);

  const totalYearInterest = chartData.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-6 p-2 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Chi Tiết Tiền Lãi
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Báo cáo tổng tiền lãi thực tế thu về của chi nhánh theo từng ngày và thống kê biểu đồ theo tháng.
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2 bg-white/65 border border-slate-200/80 rounded-2xl p-2 px-3 backdrop-blur-md">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-slate-500 text-xs font-semibold">Chọn Năm:</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-transparent text-slate-700 text-xs font-bold focus:outline-none border-none cursor-pointer"
          >
            {Array.from({ length: 5 }, (_, idx) => {
              const y = new Date().getFullYear() - idx;
              return (
                <option key={y} value={y} className="bg-slate-50 text-slate-800">
                  {y}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-error bg-red-500/10 border-red-500/20 text-red-200 shadow-lg rounded-2xl flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Yearly Stat summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/65 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden group col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full transition-all duration-300 group-hover:scale-110" />
          <div className="p-3 bg-amber-500/10 rounded-2xl w-fit text-amber-500 mb-4">
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Tổng Lãi Thu Năm {year}</p>
          <h2 className="text-3xl font-extrabold text-slate-800 mt-2">
            {formatCurrency(totalYearInterest)}
          </h2>
          <p className="text-slate-500 text-xs mt-1">Cộng dồn tất cả tiền lãi 12 tháng qua</p>
        </div>
      </div>

      {/* Visual Bar Chart */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Biểu Đồ Lãi Thu Nhập Hàng Tháng (Năm {year})</h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner text-amber-500"></span>
          </div>
        ) : (
          <div className="h-64 flex items-end justify-between gap-2 pt-8 pb-4 border-b border-slate-200/80/60 overflow-x-auto min-w-[600px] px-4">
            {chartData.map((item, idx) => {
              const heightPct = (Number(item.amount) / maxMonthValue) * 100;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <span className="text-[10px] text-amber-600 font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {formatCurrency(item.amount)}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-orange-600 via-amber-500 to-amber-400 rounded-t-lg transition-all duration-500 ease-out shadow-lg shadow-amber-500/5 group-hover:shadow-amber-500/20"
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  />
                  <span className="text-[10px] text-slate-500 font-semibold mt-2">{item.month.split("/")[0]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Table */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Chi Tiết Nhật Ký Đóng Tiền Lãi</h3>
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
                  <th>Ngày Đóng</th>
                  <th>Mã HĐ</th>
                  <th>Phân Phân Loại</th>
                  <th>Khách Hàng</th>
                  <th>Tài Sản Thế Chấp</th>
                  <th>Tiền Vay Ban Đầu</th>
                  <th>Tiền Lãi Đã Thu</th>
                  <th>Khác / Phạt</th>
                  <th>Tổng Thực Thu</th>
                </tr>
              </thead>
              <tbody>
                {details.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      Không tìm thấy lịch sử đóng lãi.
                    </td>
                  </tr>
                ) : (
                  details.map((d) => (
                    <tr key={d.id} className="border-b border-slate-200/40 hover:bg-slate-50/50 text-xs">
                      <td>{new Date(d.transaction_date).toLocaleString("vi-VN")}</td>
                      <td className="font-semibold text-slate-700">{d.contract_code}</td>
                      <td>
                        <span className="badge badge-sm badge-warning badge-outline text-[10px] font-bold">
                          {d.type.includes("Cầm đồ") ? "Cầm đồ" : "Tín chấp"}
                        </span>
                      </td>
                      <td className="font-bold text-slate-800">{d.customer_name}</td>
                      <td>{d.commodity_name}</td>
                      <td>{formatCurrency(d.loan_amount)}</td>
                      <td className="text-emerald-400 font-bold">{formatCurrency(d.interest_amount)}</td>
                      <td className="text-slate-500">{formatCurrency(d.other_amount)}</td>
                      <td className="text-amber-600 font-black">{formatCurrency(d.total_interest)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
