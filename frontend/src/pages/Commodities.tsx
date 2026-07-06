import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Package, FileCode, Tag, Layers, RefreshCw } from "lucide-react";

interface Commodity {
  id: string;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export const Commodities: React.FC = () => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const fetchCommodities = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/commodities");
      setCommodities(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải danh sách nhóm tài sản.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommodities();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      setError("Vui lòng nhập đầy đủ tên và mã loại tài sản");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await axios.post("/api/commodities", {
        name,
        code: code.toUpperCase().trim(),
        description,
      });
      setSuccess("Cấu hình tài sản thế chấp thành công!");
      setName("");
      setCode("");
      setDescription("");
      setIsCreateOpen(false);
      fetchCommodities();
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể cấu hình loại tài sản.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-slate-200/80 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Package className="text-amber-500 w-7 h-7" />
            Cấu Hình Mặt Hàng Thế Chấp
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thiết lập danh mục các loại hàng hóa cầm cố được chấp nhận giao dịch trong hệ thống (Ví dụ: Xe máy, Ô tô, Điện thoại).
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCommodities} className="btn btn-outline border-slate-200 text-slate-600 btn-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 btn-sm font-bold gap-1 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Cấu hình nhóm tài sản mới
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

      {loading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-amber-500"></span>
        </div>
      ) : commodities.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200/80 rounded-2xl text-slate-500">
          Chưa cấu hình loại tài sản nào
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commodities.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200/80 hover:border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    {item.name}
                  </h3>
                  <span className="badge badge-amber badge-xs font-bold bg-amber-500/10 border-amber-500/25 text-amber-500 uppercase tracking-wide px-2 py-1">
                    {item.code}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-slate-500 mt-4 leading-relaxed bg-slate-50/40 p-3 border border-slate-200/60 rounded-xl">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80/60 text-xs text-slate-500 font-semibold flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Thiết lập ngày: {new Date(item.created_at).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="modal modal-open">
          <div className="modal-box bg-white border border-slate-200 border border-slate-200/80 text-slate-800 rounded-2xl">
            <h3 className="font-extrabold text-lg text-amber-500 mb-4">Cấu Hình Nhóm Tài Sản Mới</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label text-slate-600 font-semibold text-sm">Tên loại tài sản *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Xe Máy Côn Tay"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="label text-slate-600 font-semibold text-sm">Mã hệ thống (Ký tự viết liền không dấu) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <FileCode className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Ví dụ: XEMAY"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="input input-bordered w-full pl-10 bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl focus:border-amber-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label text-slate-600 font-semibold text-sm">Mô tả quy cách kiểm định thế chấp</label>
                <textarea
                  placeholder="Cần lưu trữ biển số xe, số khung, số máy khi tiếp nhận..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea textarea-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl h-24"
                />
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline border-slate-200 text-slate-600 rounded-xl">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 rounded-xl font-bold">
                  Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
