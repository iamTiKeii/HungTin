import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Search, Users, Phone, MapPin } from "lucide-react";

interface Collaborator {
  id: string;
  full_name: string;
  phone: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export const Collaborators: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const fetchCollaborators = async (search = "") => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`/api/collaborators?search=${search}`);
      setCollaborators(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải danh sách cộng tác viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborators();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCollaborators(searchQuery);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await axios.post("/api/collaborators", {
        fullName,
        phone,
        address,
        notes,
      });
      setSuccess("Thêm cộng tác viên mới thành công!");
      setFullName("");
      setPhone("");
      setAddress("");
      setNotes("");
      setIsCreateOpen(false);
      fetchCollaborators();
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tạo cộng tác viên.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/80 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Users className="text-amber-500 w-7 h-7" />
            Quản Lý Cộng Tác Viên
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Danh sách cộng tác viên giới thiệu khách hàng vay trả góp, cầm đồ hoặc tín chấp.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 btn-sm font-bold gap-1 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Đăng ký cộng tác viên mới
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
            placeholder="Tìm kiếm theo Tên cộng tác viên hoặc Số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full pl-11 bg-white border-slate-200 text-slate-800 focus:border-amber-500 focus:outline-none rounded-xl"
          />
        </div>
        <button type="submit" className="btn btn-neutral border-slate-200/80 text-slate-700 font-bold rounded-xl px-6">
          Tìm kiếm
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-amber-500"></span>
        </div>
      ) : collaborators.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200/80 rounded-2xl text-slate-500">
          Không tìm thấy cộng tác viên nào phù hợp
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collaborators.map((collab) => (
            <div
              key={collab.id}
              className="bg-white border border-slate-200/80 hover:border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-lg"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-800">{collab.full_name}</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>SĐT: {collab.phone}</span>
                  </div>
                  {collab.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                      <span>Đ/c: {collab.address}</span>
                    </div>
                  )}
                  {collab.notes && (
                    <div className="bg-slate-50/50 border border-slate-200/60 p-2 rounded-lg text-xs text-amber-500 mt-2 font-semibold">
                      Ghi chú: {collab.notes}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80/60 text-xs text-slate-500 font-semibold">
                Đăng ký ngày: {new Date(collab.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-white border border-slate-200 border border-slate-200/80 text-slate-800 rounded-2xl">
            <h3 className="font-extrabold text-lg text-amber-500 mb-4">Đăng Ký Cộng Tác Viên</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label text-slate-600 font-semibold text-sm">Họ và tên cộng tác viên *</label>
                <input
                  type="text"
                  placeholder="Lê Văn D"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input input-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="label text-slate-600 font-semibold text-sm">Số điện thoại *</label>
                <input
                  type="text"
                  placeholder="0911223344"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input input-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="label text-slate-600 font-semibold text-sm">Địa chỉ cư trú</label>
                <input
                  type="text"
                  placeholder="456 Đường XYZ, Quận B, TP. HCM"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input input-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl"
                />
              </div>
              <div>
                <label className="label text-slate-600 font-semibold text-sm">Ghi chú (Tỷ lệ chiết khấu giới thiệu...)</label>
                <textarea
                  placeholder="Hưởng 1% trên thực giải ngân..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="textarea textarea-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl h-20"
                />
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline border-slate-200 text-slate-600 rounded-xl">
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
