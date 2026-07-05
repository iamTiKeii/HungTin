import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, ToggleLeft, ToggleRight, DollarSign, Landmark, RefreshCw } from "lucide-react";

interface Store {
  id: string;
  name: string;
  investment_capital: number;
  status: string;
  created_at: string;
  _count?: {
    employees: number;
  };
}

export const Stores: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [investmentCapital, setInvestmentCapital] = useState("");

  // Capital Adjustment state
  const [isCapitalOpen, setIsCapitalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [capitalAmount, setCapitalAmount] = useState("");
  const [capitalAction, setCapitalAction] = useState<"inject" | "withdraw">("inject");

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/api/stores");
      setStores(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải danh sách chi nhánh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      setError("");
      setSuccess("");
      await axios.post("/api/stores", {
        name,
        investmentCapital: Number(investmentCapital) || 0,
      });
      setSuccess("Tạo mới chi nhánh thành công!");
      setName("");
      setInvestmentCapital("");
      setIsCreateOpen(false);
      fetchStores();
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tạo chi nhánh.");
    }
  };

  const handleToggleStatus = async (store: Store) => {
    const newStatus = store.status === "active" ? "inactive" : "active";
    try {
      setError("");
      setSuccess("");
      await axios.put(`/api/stores/${store.id}/status`, { status: newStatus });
      setSuccess(`Cập nhật trạng thái ${store.name} thành công!`);
      fetchStores();
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể cập nhật trạng thái chi nhánh.");
    }
  };

  const handleCapitalAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || !capitalAmount) return;

    try {
      setError("");
      setSuccess("");
      const endpoint = capitalAction === "inject" ? "inject-capital" : "withdraw-capital";
      await axios.post(`/api/stores/${selectedStore.id}/${endpoint}`, {
        amount: Number(capitalAmount),
      });
      setSuccess("Điều chỉnh vốn đầu tư chi nhánh thành công!");
      setCapitalAmount("");
      setIsCapitalOpen(false);
      setSelectedStore(null);
      fetchStores();
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể điều chỉnh vốn chi nhánh.");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Landmark className="text-amber-500 w-7 h-7" />
            Quản Lý Chuỗi Chi Nhánh
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Thiết lập danh sách chi nhánh, quản trị luân chuyển vốn đầu tư ban đầu và cấu hình hoạt động.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchStores} className="btn btn-outline border-slate-700 text-slate-300 btn-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 btn-sm font-bold gap-1"
          >
            <Plus className="w-4 h-4" />
            Thêm chi nhánh mới
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((s) => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-slate-100">{s.name}</h3>
                  <span className={`badge font-bold badge-sm uppercase ${s.status === "active" ? "badge-success" : "badge-neutral text-slate-400"}`}>
                    {s.status === "active" ? "Hoạt động" : "Tạm ngưng"}
                  </span>
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-400">
                  <div className="flex justify-between">
                    <span>Vốn đầu tư:</span>
                    <span className="text-slate-200 font-bold">{formatCurrency(s.investment_capital)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số nhân viên:</span>
                    <span className="text-slate-200 font-bold">{s._count?.employees || 0} nhân sự</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày tạo:</span>
                    <span className="text-slate-300">{new Date(s.created_at).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setSelectedStore(s);
                    setIsCapitalOpen(true);
                  }}
                  className="btn btn-outline border-slate-700 text-slate-300 btn-xs flex-1 hover:bg-slate-800"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                  Rót/Rút vốn
                </button>
                <button
                  onClick={() => handleToggleStatus(s)}
                  className={`btn btn-xs gap-1 flex-1 font-bold ${
                    s.status === "active" ? "btn-neutral text-red-400 hover:bg-red-500/10" : "btn-primary bg-amber-500 border-none text-slate-950"
                  }`}
                >
                  {s.status === "active" ? (
                    <>
                      <ToggleLeft className="w-4 h-4" /> Ngưng hoạt động
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4" /> Kích hoạt lại
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
            <h3 className="font-extrabold text-lg text-amber-500 mb-4">Khai Trương Chi Nhánh Mới</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label text-slate-300 font-semibold text-sm">Tên chi nhánh *</label>
                <input
                  type="text"
                  placeholder="Hùng Tín - Chi nhánh Gò Vấp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full bg-slate-950 border-slate-800 text-slate-100 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="label text-slate-300 font-semibold text-sm">Vốn đầu tư ban đầu (VNĐ)</label>
                <input
                  type="number"
                  placeholder="1000000000"
                  value={investmentCapital}
                  onChange={(e) => setInvestmentCapital(e.target.value)}
                  className="input input-bordered w-full bg-slate-950 border-slate-800 text-slate-100 rounded-xl"
                />
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline border-slate-700 text-slate-300 rounded-xl">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 rounded-xl font-bold">
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CAPITAL ADJUSTMENT MODAL */}
      {isCapitalOpen && selectedStore && (
        <div className="modal modal-open">
          <div className="modal-box bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl">
            <h3 className="font-extrabold text-lg text-amber-500 mb-2">Điều Chỉnh Vốn Chi Nhánh</h3>
            <p className="text-slate-400 text-xs font-semibold mb-4">Đơn vị: {selectedStore.name}</p>
            <form onSubmit={handleCapitalAdjust} className="space-y-4">
              <div>
                <label className="label text-slate-300 font-semibold text-sm">Hướng giao dịch</label>
                <select
                  value={capitalAction}
                  onChange={(e: any) => setCapitalAction(e.target.value)}
                  className="select select-bordered w-full bg-slate-950 border-slate-800 text-slate-100 rounded-xl"
                >
                  <option value="inject">Rót thêm vốn đầu tư (+)</option>
                  <option value="withdraw">Rút bớt vốn đầu tư (-)</option>
                </select>
              </div>
              <div>
                <label className="label text-slate-300 font-semibold text-sm">Số tiền giao dịch (VNĐ) *</label>
                <input
                  type="number"
                  placeholder="500000000"
                  value={capitalAmount}
                  onChange={(e) => setCapitalAmount(e.target.value)}
                  className="input input-bordered w-full bg-slate-950 border-slate-800 text-slate-100 rounded-xl"
                  required
                />
              </div>
              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setIsCapitalOpen(false);
                    setSelectedStore(null);
                  }}
                  className="btn btn-outline border-slate-700 text-slate-300 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 rounded-xl font-bold">
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
