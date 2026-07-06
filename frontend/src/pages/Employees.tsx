import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, ShieldCheck, ToggleLeft, ToggleRight, User, Shield, RefreshCw } from "lucide-react";

interface Employee {
  id: string;
  username: string;
  full_name: string;
  status: string;
  store_id: string;
  store: { name: string };
  permissions: string[];
}

interface Store {
  id: string;
  name: string;
}

const AVAILABLE_PERMISSIONS = [
  { code: "STORES_MANAGE", label: "Quản trị Chi nhánh (Quyền Admin tối cao)" },
  { code: "EMPLOYEES_MANAGE", label: "Quản trị Nhân viên & Cấp quyền" },
  { code: "CUSTOMERS_MANAGE", label: "Quản lý Khách hàng & Blacklist" },
  { code: "COLLABORATORS_MANAGE", label: "Quản lý Cộng tác viên & Hoa hồng" },
  { code: "COMMODITIES_MANAGE", label: "Cấu hình Hàng hóa & Linh kiện" },
  { code: "FUNDS_MANAGE", label: "Kiểm kho Quỹ két (Xem dòng tiền/Báo cáo)" },
  { code: "VOUCHERS_MANAGE", label: "Thu / Chi tài chính (Tạo phiếu thu/chi)" },
  { code: "CONTRACTS_MANAGE", label: "Quản trị Hợp đồng (Thêm mới/Sửa/Xóa HĐ)" },
  { code: "CONTRACTS_OPERATE", label: "Vận hành Hợp đồng (Đóng góp/Gia hạn/Tất toán/Ghi nợ)" },
];

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [storeId, setStoreId] = useState("");

  // Permissions form state
  const [isPermsOpen, setIsPermsOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [empRes, storesRes] = await Promise.all([
        axios.get("/api/employees"),
        axios.get("/api/stores"),
      ]);
      setEmployees(empRes.data);
      setStores(storesRes.data.filter((s: any) => s.status === "active"));
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể tải dữ liệu nhân viên.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !fullName || !storeId) {
      setError("Vui lòng nhập đầy đủ các trường bắt buộc");
      return;
    }

    try {
      setError("");
      setSuccess("");
      await axios.post("/api/employees", {
        username,
        password,
        fullName,
        storeId,
      });
      setSuccess("Tạo mới tài khoản nhân viên thành công!");
      setUsername("");
      setPassword("");
      setFullName("");
      setStoreId("");
      setIsCreateOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể thêm nhân viên.");
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const newStatus = emp.status === "active" ? "inactive" : "active";
    try {
      setError("");
      setSuccess("");
      await axios.put(`/api/employees/${emp.id}/status`, { status: newStatus });
      setSuccess(`Cập nhật trạng thái cho ${emp.full_name} thành công!`);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể cập nhật trạng thái nhân viên.");
    }
  };

  const openPermissionsModal = (emp: Employee) => {
    setSelectedEmp(emp);
    const codes = (emp.permissions as any[]).map((p) => p.permission?.code).filter(Boolean);
    setSelectedPerms(codes);
    setIsPermsOpen(true);
  };

  const handlePermissionToggle = (code: string) => {
    if (selectedPerms.includes(code)) {
      setSelectedPerms(selectedPerms.filter((p) => p !== code));
    } else {
      setSelectedPerms([...selectedPerms, code]);
    }
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    try {
      setError("");
      setSuccess("");
      await axios.put(`/api/employees/${selectedEmp.id}/permissions`, {
        permission_codes: selectedPerms,
      });
      setSuccess(`Cấp quyền thành công cho nhân sự ${selectedEmp.full_name}!`);
      setIsPermsOpen(false);
      setSelectedEmp(null);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Không thể cấp quyền.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white border border-slate-200/80 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <User className="text-amber-500 w-7 h-7" />
            Nhân Sự & Phân Quyền Hệ Thống
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Thiết lập tài khoản giao dịch viên tại các chi nhánh và phân quyền bảo mật riêng biệt.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn btn-outline border-slate-200 text-slate-600 btn-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 btn-sm font-bold gap-1"
          >
            <Plus className="w-4 h-4" />
            Thêm tài khoản nhân viên
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
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="table w-full text-slate-600">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-500 text-xs">
                  <th>Nhân viên</th>
                  <th>Tên đăng nhập</th>
                  <th>Chi nhánh làm việc</th>
                  <th>Số quyền sở hữu</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-200/80/50 hover:bg-slate-50/30 text-sm">
                    <td>
                      <div className="font-bold text-slate-700">{emp.full_name}</div>
                    </td>
                    <td>{emp.username}</td>
                    <td>
                      <span className="badge badge-outline border-slate-200 text-slate-600 font-bold badge-sm">
                        {emp.store?.name}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-amber badge-xs font-bold bg-amber-500/15 border-amber-500/20 text-amber-500">
                        {emp.permissions.length} nodes
                      </span>
                    </td>
                    <td>
                      <span className={`badge font-bold badge-xs uppercase ${emp.status === "active" ? "badge-success" : "badge-neutral text-slate-500"}`}>
                        {emp.status === "active" ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                    <td className="text-right flex items-center justify-end gap-2 py-3">
                      <button
                        onClick={() => openPermissionsModal(emp)}
                        className="btn btn-outline border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10 text-amber-500 btn-xs"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Phân quyền
                      </button>
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`btn btn-xs gap-1 font-bold ${
                          emp.status === "active" ? "btn-neutral text-red-400 hover:bg-red-500/10" : "btn-primary bg-amber-500 border-none text-slate-950"
                        }`}
                      >
                        {emp.status === "active" ? (
                          <>
                            <ToggleLeft className="w-4 h-4" /> Khóa
                          </>
                        ) : (
                          <>
                            <ToggleRight className="w-4 h-4" /> Mở khóa
                          </>
                        )}
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
          <div className="modal-box bg-white border border-slate-200 border border-slate-200/80 text-slate-800 rounded-2xl">
            <h3 className="font-extrabold text-lg text-amber-500 mb-4">Tạo Tài Khoản Nhân Viên Mới</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label text-slate-600 font-semibold text-sm">Họ và tên *</label>
                <input
                  type="text"
                  placeholder="Lê Văn B"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input input-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl input-md focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-slate-600 font-semibold text-sm">Tên đăng nhập *</label>
                  <input
                    type="text"
                    placeholder="levanb"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input input-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl input-md focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="label text-slate-600 font-semibold text-sm">Mật khẩu *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl input-md focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label text-slate-600 font-semibold text-sm">Giao chi nhánh làm việc *</label>
                <select
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="select select-bordered w-full bg-slate-955 border-slate-200/80 text-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
                  required
                >
                  <option value="">-- Chọn chi nhánh làm việc --</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-action">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn btn-outline border-slate-200 text-slate-600 rounded-xl">
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 rounded-xl font-bold">
                  Tạo tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERMISSIONS MODAL */}
      {isPermsOpen && selectedEmp && (
        <div className="modal modal-open">
          <div className="modal-box bg-white border border-slate-200 border border-slate-200/80 text-slate-800 rounded-2xl max-w-lg">
            <h3 className="font-extrabold text-lg text-amber-500 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              Thiết Lập Quyền Nhân Sự
            </h3>
            <p className="text-slate-500 text-xs font-semibold mt-1 mb-4">
              Nhân viên: <span className="text-slate-700">{selectedEmp.full_name}</span> ({selectedEmp.username}) - {selectedEmp.store.name}
            </p>
            <form onSubmit={handleSavePermissions} className="space-y-4">
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-2">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const isChecked = selectedPerms.includes(perm.code);
                  return (
                    <label
                      key={perm.code}
                      onClick={() => handlePermissionToggle(perm.code)}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all select-none ${
                        isChecked
                          ? "bg-amber-500/10 border-amber-500/40 text-slate-800 font-medium"
                          : "bg-slate-50/60 border-slate-200/80 hover:border-slate-200 text-slate-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="checkbox checkbox-primary border-slate-600 [--chkfg:slate-950] checked:border-amber-500 checked:bg-amber-500 mt-0.5"
                      />
                      <div className="text-xs">
                        <p className={`font-semibold ${isChecked ? "text-amber-500" : "text-slate-600"}`}>{perm.code}</p>
                        <p className="text-slate-500 mt-0.5">{perm.label}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setIsPermsOpen(false);
                    setSelectedEmp(null);
                  }}
                  className="btn btn-outline border-slate-200 text-slate-600 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary bg-amber-500 hover:bg-amber-600 border-none text-slate-950 rounded-xl font-bold">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
