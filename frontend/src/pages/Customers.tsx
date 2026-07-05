import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, AlertOctagon, ShieldAlert, User, Phone, FileText, CheckCircle } from "lucide-react";

interface Customer {
  id: string;
  full_name: string;
  phone: string;
  identity_number: string;
  address?: string;
  notes?: string;
  status: string;
  created_at: string;
}

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const fetchCustomers = async (search = "") => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`/api/customers?search=${search}`);
      setCustomers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải danh sách khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchQuery);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !identityNumber) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await axios.post("/api/customers", {
        fullName,
        phone,
        identityNumber,
        address,
        notes,
      });
      setSuccess("Thêm thông tin khách hàng mới thành công!");
      setFullName("");
      setPhone("");
      setIdentityNumber("");
      setAddress("");
      setNotes("");
      setIsCreateOpen(false);
      fetchCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tạo hồ sơ khách hàng.");
    }
  };

  const handleToggleBlacklist = async (cust: Customer) => {
    const newStatus = cust.status === "blacklist" ? "active" : "blacklist";
    try {
      setError("");
      setSuccess("");
      await axios.put(`/api/customers/${cust.id}/status`, { status: newStatus });
      setSuccess(`Cập nhật trạng thái cho khách hàng ${cust.full_name} thành công!`);
      fetchCustomers(searchQuery);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể cập nhật trạng thái khách hàng.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <User className="text-amber-500 w-7 h-7" />
            Hồ Sơ & Danh Sách Khách Hàng
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tra cứu thông tin khách hàng giao dịch, cảnh báo nợ xấu hoặc đưa vào danh sách đen (Blacklist).
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 btn-sm font-bold gap-1 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Đăng ký khách hàng mới
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

      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm theo Tên khách hàng, Số điện thoại hoặc CCCD..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-11 bg-slate-900 border-slate-800 text-slate-100 focus:border-amber-500 focus:outline-none rounded-xl"
          />
        </div>
        <button type="submit" className="btn btn-neutral border-slate-800 text-slate-200 font-bold rounded-xl px-6">
          Tìm kiếm
        </button>
      </form>

      {/* Grid of customers */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-amber-500"></span>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500">
          Không tìm thấy hồ sơ khách hàng phù hợp
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((cust) => (
            <div
              key={cust.id}
              className={`bg-slate-900 border rounded-2xl p-6 flex flex-col justify-between shadow-lg relative overflow-hidden transition-all ${
                cust.status === "blacklist" ? "border-red-500/30 hover:border-red-500/50" : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {cust.status === "blacklist" && (
                <div className="absolute top-0 right-0 bg-red-500/10 border-b border-l border-red-500/30 px-3 py-1 text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1 rounded-bl-xl">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  NỢ XẤU / BLACKLIST
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  {cust.full_name}
                </h3>
                <div className="mt-4 space-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>SĐT: {cust.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>CCCD: {cust.identity_number}</span>
                  </div>
                  {cust.address && <p className="text-xs text-slate-400 mt-1">Đ/c: {cust.address}</p>}
                  {cust.notes && (
                    <div className="bg-slate-950/50 border border-slate-800/80 p-2 rounded-lg text-xs text-amber-500 mt-2 font-semibold">
                      Ghi chú: {cust.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/60">
                <button
                  onClick={() => handleToggleBlacklist(cust)}
                  className={`btn btn-xs gap-1 flex-1 font-extrabold ${
                    cust.status === "blacklist"
                      ? "btn-success bg-emerald-500 hover:bg-emerald-600 border-none text-slate-950"
                      : "btn-error bg-red-500 hover:bg-red-600 border-none text-slate-950"
                  }`}
                >
                  {cust.status === "blacklist" ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Xóa nợ xấu
                    </>
                  ) : (
                    <>
                      <AlertOctagon className="w-3.5 h-3.5" /> Đánh dấu BLACKLIST
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl">
            <h3 className="font-extrabold text-lg text-amber-500 mb-4">Đăng Ký Hồ Sơ Khách Hàng</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label text-slate-300 font-semibold text-sm">Họ và tên khách hàng *</label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn C"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input input-bordered w-full bg-slate-955 border-slate-800 text-slate-100 rounded-xl input-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-slate-300 font-semibold text-sm">Số điện thoại *</label>
                  <input
                    type="text"
                    placeholder="0901234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input input-bordered w-full bg-slate-955 border-slate-800 text-slate-100 rounded-xl input-md"
                    required
                  />
                </div>
                <div>
                  <label className="label text-slate-300 font-semibold text-sm">Số CCCD / Hộ chiếu *</label>
                  <input
                    type="text"
                    placeholder="079012345678"
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    className="input input-bordered w-full bg-slate-955 border-slate-800 text-slate-100 rounded-xl input-md"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label text-slate-300 font-semibold text-sm">Địa chỉ liên hệ</label>
                <input
                  type="text"
                  placeholder="123 Đường ABC, Phường X, Quận Y"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input input-bordered w-full bg-slate-955 border-slate-800 text-slate-100 rounded-xl input-md"
                />
              </div>
              <div>
                <label className="label text-slate-300 font-semibold text-sm">Ghi chú đặc điểm hoặc xếp hạng</label>
                <textarea
                  placeholder="Khách quen / Chậm trễ đóng lãi..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="textarea textarea-bordered w-full bg-slate-955 border-slate-800 text-slate-100 rounded-xl h-20"
                />
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline border-slate-700 text-slate-300 rounded-xl">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 rounded-xl font-bold">
                  Lưu hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
