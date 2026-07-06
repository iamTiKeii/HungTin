import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CollaboratorReport: React.FC = () => {
  const { activeStore } = useAuth();
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    if (!activeStore) return;
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/reports/collaborators");
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Lỗi khi tải báo cáo cộng tác viên.");
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

  const filteredData = data.filter((item) =>
    item.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-2 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
          Báo Cáo Cộng Tác Viên
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Theo dõi doanh số giới thiệu khách hàng, số lượng hợp đồng phát sinh và hiệu quả đóng lãi từ mạng lưới cộng tác viên.
        </p>
      </div>

      {error && (
        <div className="alert alert-error bg-red-500/10 border-red-500/20 text-red-200 shadow-lg rounded-2xl flex gap-3">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 backdrop-blur-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm cộng tác viên bằng tên hoặc mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full rounded-2xl bg-slate-50 border-slate-200/80 pl-12 text-slate-800 focus:border-amber-500"
            />
          </div>
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
                  <th>STT</th>
                  <th>Mã CTV</th>
                  <th>Họ Tên CTV</th>
                  <th>Số Điện Thoại</th>
                  <th>Số Lượng HĐ Giới Thiệu</th>
                  <th>Tổng Tiền Giải Ngân</th>
                  <th>Lãi Đã Thu</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      Không tìm thấy dữ liệu cộng tác viên nào.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <tr key={item.id} className="border-b border-slate-200/40 hover:bg-slate-50/50 text-xs">
                      <td>{idx + 1}</td>
                      <td className="font-semibold text-slate-700">{item.code || "—"}</td>
                      <td className="font-bold text-slate-800">{item.full_name}</td>
                      <td>{item.phone || "—"}</td>
                      <td className="font-semibold text-amber-500">{item.contract_count} HĐ</td>
                      <td className="font-bold">{formatCurrency(item.total_disbursed)}</td>
                      <td className="text-emerald-400 font-extrabold">{formatCurrency(item.total_interest_paid)}</td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold rounded-lg px-2.5 py-1 ${
                            item.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-50 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {item.status === "active" ? "Đang hợp tác" : "Ngưng hợp tác"}
                        </span>
                      </td>
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
