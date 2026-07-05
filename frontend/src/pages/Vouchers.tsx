import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Plus, Search, Receipt, Printer, RefreshCw, X } from "lucide-react";
import { useReactToPrint } from "react-to-print";

interface Voucher {
  id: string;
  voucher_code: string;
  type: string;
  partner_name: string;
  amount: number;
  description?: string;
  created_at: string;
  employee?: {
    full_name: string;
  };
}

export const Vouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [typeFilter, setTypeFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [type, setType] = useState<"receipt" | "payment">("receipt");
  const [partnerName, setPartnerName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  // Printing state
  const [activePrintVoucher, setActivePrintVoucher] = useState<Voucher | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`/api/vouchers?type=${typeFilter}&search=${searchQuery}`);
      setVouchers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải danh sách phiếu thu/chi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [typeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVouchers();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !amount) {
      setError("Vui lòng điền các trường bắt buộc");
      return;
    }

    try {
      setError("");
      setSuccess("");
      const res = await axios.post("/api/vouchers", {
        type,
        partnerName,
        amount: Number(amount),
        description,
      });
      setSuccess(`Đã tạo phiếu ${type === "receipt" ? "thu" : "chi"} thành công!`);
      setPartnerName("");
      setAmount("");
      setDescription("");
      setIsCreateOpen(false);
      fetchVouchers();
      // Auto open print preview for the created voucher
      setActivePrintVoucher(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tạo phiếu thu chi.");
    }
  };

  // Printing logic using react-to-print
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => setActivePrintVoucher(null),
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Receipt className="text-amber-500 w-7 h-7" />
            Quản Lý Phiếu Thu / Phiếu Chi
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Ghi nhận các khoản thu chi hoạt động khác ngoài hợp đồng và in biên nhận K80 cho đối tác.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={fetchVouchers} className="btn btn-outline border-slate-700 text-slate-300 btn-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 btn-sm font-bold gap-1 rounded-xl flex-1 md:flex-none"
          >
            <Plus className="w-4 h-4" />
            Lập phiếu mới
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error bg-red-500/10 border-red-500/30 text-red-200 text-sm rounded-xl">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success bg-emerald-500/10 border-emerald-500/30 text-emerald-200 text-sm rounded-xl">
          <span>{success}</span>
        </div>
      )}

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã phiếu hoặc tên người nộp/nhận..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-11 bg-slate-900 border-slate-800 text-slate-100 focus:border-amber-500 focus:outline-none rounded-xl"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="select select-bordered bg-slate-900 border-slate-800 text-slate-300 rounded-xl"
        >
          <option value="">Tất cả loại phiếu</option>
          <option value="receipt">Phiếu Thu (Nhập két)</option>
          <option value="payment">Phiếu Chi (Xuất két)</option>
        </select>
        <button type="submit" className="btn btn-neutral border-slate-800 text-slate-200 font-bold rounded-xl px-6">
          Tìm kiếm
        </button>
      </form>

      {/* Vouchers Table */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-amber-500"></span>
        </div>
      ) : vouchers.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
          Chưa phát sinh phiếu thu chi nào phù hợp bộ lọc
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-300">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th>Mã phiếu</th>
                  <th>Loại phiếu</th>
                  <th>Đối tác liên quan</th>
                  <th>Số tiền mặt</th>
                  <th>Nội dung thanh toán</th>
                  <th>Ngày lập</th>
                  <th className="text-right">In phiếu</th>
                </tr>
              </thead>
              <tbody>
                {vouchers.map((v) => (
                  <tr key={v.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 text-sm">
                    <td className="font-bold text-amber-500">{v.voucher_code}</td>
                    <td>
                      <span className={`badge font-bold badge-xs uppercase ${v.type === "receipt" ? "badge-success" : "badge-error"}`}>
                        {v.type === "receipt" ? "Thu" : "Chi"}
                      </span>
                    </td>
                    <td className="font-bold text-slate-200">{v.partner_name}</td>
                    <td className={`font-black ${v.type === "receipt" ? "text-emerald-500" : "text-red-500"}`}>
                      {formatCurrency(v.amount)}
                    </td>
                    <td className="text-slate-400 max-w-xs truncate">{v.description}</td>
                    <td className="text-slate-400 font-semibold">{new Date(v.created_at).toLocaleDateString("vi-VN")}</td>
                    <td className="text-right py-3">
                      <button
                        onClick={() => setActivePrintVoucher(v)}
                        className="btn btn-outline border-slate-700 hover:bg-slate-800 btn-xs text-slate-300"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        In K80
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl">
            <h3 className="font-extrabold text-lg text-amber-500 mb-4">Lập Phiếu Thu / Chi</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-slate-300 font-semibold text-sm">Loại chứng từ</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="select select-bordered w-full bg-slate-955 border-slate-800 text-slate-100 rounded-xl focus:border-amber-500"
                  >
                    <option value="receipt">Phiếu Thu (+ két)</option>
                    <option value="payment">Phiếu Chi (- két)</option>
                  </select>
                </div>
                <div>
                  <label className="label text-slate-300 font-semibold text-sm">Số tiền mặt (VNĐ) *</label>
                  <input
                    type="number"
                    placeholder="1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input input-bordered w-full bg-slate-955 border-slate-800 text-slate-100 rounded-xl"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label text-slate-300 font-semibold text-sm">Đối tác nộp/nhận tiền *</label>
                <input
                  type="text"
                  placeholder="Họ tên người nhận/nộp"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="input input-bordered w-full bg-slate-955 border-slate-800 text-slate-100 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="label text-slate-300 font-semibold text-sm">Nội dung diễn giải chi tiết</label>
                <textarea
                  placeholder="Lý do thu/chi..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea textarea-bordered w-full bg-slate-955 border-slate-800 text-slate-100 rounded-xl h-20"
                />
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline border-slate-700 text-slate-300 rounded-xl">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 rounded-xl font-bold">
                  Xác nhận & Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW MODAL */}
      {activePrintVoucher && (
        <div className="modal modal-open">
          <div className="modal-box bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 mb-4">
              <span className="font-extrabold text-sm text-slate-300">Biên nhận in K80</span>
              <button onClick={() => setActivePrintVoucher(null)} className="btn btn-ghost btn-circle btn-xs text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Thermal Content Container */}
            <div className="bg-white p-4 text-black border border-slate-300 rounded-lg text-xs leading-relaxed">
              <div ref={printRef} className="print-area">
                <div className="print-header font-bold" style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "14px", margin: "2px 0" }}>CẦM ĐỒ HÙNG TÍN</p>
                  <p style={{ fontSize: "10px", margin: "2px 0", color: "#666" }}>Dịch vụ Tài chính & Tín dụng tiêu dùng</p>
                </div>
                <div className="print-divider" style={{ borderTop: "1px dashed black", margin: "8px 0" }}></div>

                <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "12px", margin: "4px 0" }}>
                  {activePrintVoucher.type === "receipt" ? "PHIẾU THU TIỀN MẶT" : "PHIẾU CHI TIỀN MẶT"}
                </div>
                <div style={{ textAlign: "center", fontSize: "9px", margin: "2px 0" }}>
                  Số phiếu: {activePrintVoucher.voucher_code}
                </div>

                <div style={{ margin: "10px 0" }}>
                  <table className="print-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: "3px 0" }}>Đối tác:</td>
                        <td className="print-text-right" style={{ textAlign: "right", fontWeight: "bold" }}>
                          {activePrintVoucher.partner_name}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 0" }}>Số tiền:</td>
                        <td className="print-text-right" style={{ textAlign: "right", fontWeight: "bold", fontSize: "12px" }}>
                          {formatCurrency(activePrintVoucher.amount)}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 0", verticalAlign: "top" }}>Nội dung:</td>
                        <td className="print-text-right" style={{ textAlign: "right" }}>
                          {activePrintVoucher.description || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 0" }}>Ngày lập:</td>
                        <td className="print-text-right" style={{ textAlign: "right" }}>
                          {new Date(activePrintVoucher.created_at).toLocaleString("vi-VN")}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "3px 0" }}>Nhân viên:</td>
                        <td className="print-text-right" style={{ textAlign: "right" }}>
                          {activePrintVoucher.employee?.full_name}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="print-divider" style={{ borderTop: "1px dashed black", margin: "8px 0" }}></div>
                <div style={{ display: "flex", justifyContent: "space-between", textAlign: "center", marginTop: "10px" }}>
                  <div>
                    <p style={{ margin: 0 }}>Người giao/nhận</p>
                    <p style={{ fontSize: "8px", color: "#666", margin: 0 }}>(Ký và ghi rõ họ tên)</p>
                  </div>
                  <div>
                    <p style={{ margin: 0 }}>Thủ quỹ lập phiếu</p>
                    <p style={{ fontSize: "8px", color: "#666", margin: 0 }}>(Ký và ghi rõ họ tên)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button onClick={() => setActivePrintVoucher(null)} className="btn btn-outline border-slate-700 text-slate-300 rounded-xl">
                Đóng lại
              </button>
              <button onClick={handlePrint} className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 font-bold rounded-xl gap-1">
                <Printer className="w-4 h-4" />
                In nhiệt ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
