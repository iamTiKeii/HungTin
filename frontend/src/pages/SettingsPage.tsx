import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { 
  Settings, 
  Save, 
  Upload, 
  Image as ImageIcon,
  HelpCircle,
  Printer,
  FileText,
  Copy,
  Check,
  FileCode,
  Building2
} from "lucide-react";
import { toast } from "../lib/toast";
import { 
  getTemplatesByModule, 
  MODULE_PLACEHOLDERS,
  type PrintModuleType 
} from "../services/print/PrintTemplateManager";

const BANK_LIST = [
  "Vietcombank (Ngoại thương Việt Nam)",
  "Techcombank (Kỹ thương)",
  "BIDV (Đầu tư và Phát triển)",
  "MB Bank (Quân đội)",
  "Agribank (Nông nghiệp & PTNT)",
  "VietinBank (Công thương Việt Nam)",
  "ACB (Á Châu)",
  "TPBank (Tiên Phong)",
  "Sacombank (Sài Gòn Thương Tín)",
  "VPBank (Việt Nam Thịnh Vượng)",
  "VIB (Quốc tế)",
  "Shinhan Bank (Shinhan Việt Nam)",
  "OCB (Phương Đông)",
  "SHB (Sài Gòn - Hà Nội)",
  "HDBank (Phát triển TP.HCM)",
  "Eximbank (Xuất Nhập Khẩu)",
  "MSB (Hàng Hải)"
];

const removeAccents = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase();
};

export const SettingsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const isAdmin = hasPermission("EMPLOYEES_MANAGE") || hasPermission("STORES_MANAGE") || hasPermission("EMPLOYEES_PERMISSIONS");

  // Loading state
  const [loading, setLoading] = useState(false);
  const [banksList, setBanksList] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tab State
  const [activeMainTab, setActiveMainTab] = useState<"general" | "templates" | "placeholders">("general");
  const [activePlaceholderTab, setActivePlaceholderTab] = useState<PrintModuleType>("pawn");

  // Fetch VietQR banks list
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch("https://api.vietqr.io/v2/banks");
        const data = await response.json();
        if (data && data.code === "00") {
          const names = data.data.map((b: any) => b.name);
          setBanksList(names);
        }
      } catch (err) {
        console.error("Error loading VietQR banks list in settings:", err);
      }
    };
    fetchBanks();
  }, []);

  // System Settings state
  const [systemName, setSystemName] = useState("");
  const [systemLogo, setSystemLogo] = useState("");
  const [systemHotline, setSystemHotline] = useState("");
  const [systemEmail, setSystemEmail] = useState("");
  const [systemBankName, setSystemBankName] = useState("");
  const [systemBankAccountNumber, setSystemBankAccountNumber] = useState("");
  const [systemBankAccountHolder, setSystemBankAccountHolder] = useState("");

  // Print Template Settings state
  const [pawnTemplate, setPawnTemplate] = useState("CD_01_001");
  const [unsecuredTemplate, setUnsecuredTemplate] = useState("TC_01_001");
  const [installmentTemplate, setInstallmentTemplate] = useState("TG_01_001");
  const [capitalTemplate, setCapitalTemplate] = useState("GV_01_001");
  const [receiptTemplate, setReceiptTemplate] = useState("INV_01_001");
  const [paymentTemplate, setPaymentTemplate] = useState("INV_02_001");

  // Fetch initial configs
  useEffect(() => {
    if (isAdmin) {
      fetchSystemSettings();
    }
  }, [isAdmin]);

  const fetchSystemSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/settings");
      setSystemName(res.data.system_name || "");
      const logo = res.data.system_logo || "";
      setSystemLogo(logo);
      setSystemHotline(res.data.system_hotline || "");
      setSystemEmail(res.data.system_email || "");
      setSystemBankName(res.data.system_bank_name || "");
      setSystemBankAccountNumber(res.data.system_bank_account_number || "");
      setSystemBankAccountHolder(res.data.system_bank_account_holder || "");

      // Load print template settings
      const pawnCode = res.data.pawn_print_template || localStorage.getItem("pawn_print_template") || "CD_01_001";
      const unsecuredCode = res.data.unsecured_print_template || localStorage.getItem("unsecured_print_template") || "TC_01_001";
      const installmentCode = res.data.installment_print_template || localStorage.getItem("installment_print_template") || "TG_01_001";
      const capitalCode = res.data.capital_print_template || localStorage.getItem("capital_print_template") || "GV_01_001";
      const receiptCode = res.data.receipt_print_template || localStorage.getItem("receipt_print_template") || "INV_01_001";
      const paymentCode = res.data.payment_print_template || localStorage.getItem("payment_print_template") || "INV_02_001";

      setPawnTemplate(pawnCode);
      setUnsecuredTemplate(unsecuredCode);
      setInstallmentTemplate(installmentCode);
      setCapitalTemplate(capitalCode);
      setReceiptTemplate(receiptCode);
      setPaymentTemplate(paymentCode);

      // Dynamically update browser tab favicon link
      if (logo) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = logo;
      }
    } catch (err: any) {
      toast.error("Không thể tải cấu hình hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  // Convert Logo to Base64
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSystemLogo(reader.result as string);
      toast.success("Đã tải logo cửa hàng thành dạng Base64! Hãy nhấn nút Lưu cấu hình.");
    };
    reader.readAsDataURL(file);
  };

  const handleCopyTag = (tag: string) => {
    const textToCopy = `{{${tag}}}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedKey(tag);
    toast.success(`Đã sao chép ${textToCopy} vào bộ nhớ tạm!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Save to localStorage for instant client-side retrieval
      localStorage.setItem("pawn_print_template", pawnTemplate);
      localStorage.setItem("unsecured_print_template", unsecuredTemplate);
      localStorage.setItem("installment_print_template", installmentTemplate);
      localStorage.setItem("capital_print_template", capitalTemplate);
      localStorage.setItem("receipt_print_template", receiptTemplate);
      localStorage.setItem("payment_print_template", paymentTemplate);

      // Save to backend settings
      await axios.put("/api/settings", {
        system_name: systemName,
        system_logo: systemLogo,
        system_hotline: systemHotline,
        system_email: systemEmail,
        system_bank_name: systemBankName,
        system_bank_account_number: systemBankAccountNumber,
        system_bank_account_holder: systemBankAccountHolder,
        pawn_print_template: pawnTemplate,
        unsecured_print_template: unsecuredTemplate,
        installment_print_template: installmentTemplate,
        capital_print_template: capitalTemplate,
        receipt_print_template: receiptTemplate,
        payment_print_template: paymentTemplate,
      });
      toast.success("Lưu cấu hình hệ thống & Mẫu in thành công!");

      // Dynamically update browser tab favicon link
      if (systemLogo) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = systemLogo;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Cập nhật cấu hình hệ thống thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 text-center text-slate-500 font-medium">
        Bạn không có quyền truy cập cấu hình hệ thống.
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in max-w-5xl mx-auto pb-12">
      <div>
        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit uppercase">
          <Settings className="w-3.5 h-3.5" />
          <span>Cấu hình</span>
        </span>
        <h1 className="text-2xl font-black text-slate-800 mt-2">Cấu hình Hệ thống & Mẫu In</h1>
        <p className="text-slate-500 text-xs mt-0.5">Quản lý tham số chuỗi, tài khoản ngân hàng và cấu hình mẫu in hợp đồng, phiếu thu chi.</p>
      </div>

      {/* Navigation Main Tabs */}
      <div className="flex border-b border-slate-200/80 gap-2 pb-0 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveMainTab("general")}
          className={`flex items-center gap-2 py-3 px-5 font-bold text-xs border-b-2 transition-all whitespace-nowrap rounded-t-2xl ${
            activeMainTab === "general"
              ? "border-amber-500 text-amber-600 bg-white shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Thông tin hệ thống & Ngân hàng</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("templates")}
          className={`flex items-center gap-2 py-3 px-5 font-bold text-xs border-b-2 transition-all whitespace-nowrap rounded-t-2xl ${
            activeMainTab === "templates"
              ? "border-amber-500 text-amber-600 bg-white shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>2. Cấu hình Mẫu In Theo Mã</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMainTab("placeholders")}
          className={`flex items-center gap-2 py-3 px-5 font-bold text-xs border-b-2 transition-all whitespace-nowrap rounded-t-2xl ${
            activeMainTab === "placeholders"
              ? "border-amber-500 text-amber-600 bg-white shadow-sm"
              : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>3. Thẻ Biến Chèn Mẫu In (Placeholders)</span>
        </button>
      </div>

      <form onSubmit={handleSaveSystem} className="space-y-6">
        
        {/* TAB 1: THÔNG TIN HỆ THỐNG & NGÂN HÀNG */}
        {activeMainTab === "general" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6 animate-fade-in">
            <h3 className="font-bold text-base text-slate-800 border-b pb-2">Thông tin chung & Logo thương hiệu</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Logo Uploader */}
              <div className="md:col-span-1 flex flex-col items-center justify-center border border-slate-200 border-dashed rounded-2xl p-4 bg-slate-50/50">
                <label className="label text-slate-500 text-xs font-bold mb-2">Ảnh Logo Hệ thống</label>
                <div className="w-32 h-32 border bg-white rounded-2xl flex items-center justify-center overflow-hidden relative shadow-inner group">
                  {systemLogo ? (
                    <img src={systemLogo} alt="System Logo" className="object-contain w-full h-full p-2" />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-slate-600" />
                  )}
                </div>

                <div className="mt-4 w-full">
                  <label className="btn btn-outline border-slate-300 text-slate-700 btn-xs rounded-lg w-full flex items-center justify-center gap-1.5 cursor-pointer hover:bg-slate-50">
                    <Upload className="w-3 h-3" />
                    <span>Tải ảnh lên (Base64)</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden" 
                    />
                  </label>
                  <p className="text-[10px] text-slate-500 mt-2 text-center font-medium">Hỗ trợ JPG, PNG, WEBP</p>
                </div>
              </div>

              {/* Input fields */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="label text-slate-600 text-xs font-bold py-1">Tên hệ thống hiển thị *</label>
                  <input
                    type="text"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    placeholder="Ví dụ: Cầm Đồ Hưng Tín"
                    className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-lg text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label text-slate-600 text-xs font-bold py-1">Hotline hỗ trợ khách hàng</label>
                    <input
                      type="text"
                      value={systemHotline}
                      onChange={(e) => setSystemHotline(e.target.value)}
                      placeholder="0976862823"
                      className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="label text-slate-600 text-xs font-bold py-1">Email liên hệ hệ thống</label>
                    <input
                      type="email"
                      value={systemEmail}
                      onChange={(e) => setSystemEmail(e.target.value)}
                      placeholder="contact@example.com"
                      className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="label text-slate-600 text-xs font-bold py-1">Dữ liệu Base64 / URL Logo trực tiếp</label>
                  <textarea
                    value={systemLogo}
                    onChange={(e) => setSystemLogo(e.target.value)}
                    placeholder="Dán chuỗi base64 hoặc URL ảnh trực tiếp..."
                    className="textarea textarea-bordered w-full bg-white border-slate-200 text-slate-800 text-xs rounded-xl focus:border-amber-500 focus:outline-none min-h-[60px]"
                  />
                </div>
              </div>
            </div>

            {/* Section: Bank details */}
            <div className="border-t pt-4">
              <h3 className="font-bold text-sm text-slate-800 pb-2 mb-3 flex items-center gap-1.5">
                <span>Tài khoản Ngân hàng nhận tiền</span>
                <span title="Dùng để hiển thị thông tin nhận tiền giao dịch chuyển khoản.">
                  <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" />
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label text-slate-600 text-xs font-bold py-1">Tên ngân hàng</label>
                  <select
                    value={systemBankName}
                    onChange={(e) => setSystemBankName(e.target.value)}
                    className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-lg text-xs h-[32px] min-h-[32px]"
                  >
                    <option value="">-- Chọn ngân hàng --</option>
                    {(banksList.length > 0 ? banksList : BANK_LIST).map((bank) => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label text-slate-600 text-xs font-bold py-1">Số tài khoản ngân hàng</label>
                  <input
                    type="text"
                    value={systemBankAccountNumber}
                    onChange={(e) => setSystemBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="Nhập số tài khoản..."
                    className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="label text-slate-600 text-xs font-bold py-1">Chủ tài khoản (không dấu)</label>
                  <input
                    type="text"
                    value={systemBankAccountHolder}
                    onChange={(e) => setSystemBankAccountHolder(removeAccents(e.target.value))}
                    placeholder="VD: NGUYEN VAN A"
                    className="input input-bordered input-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CẤU HÌNH MẪU IN THEO MÃ */}
        {activeMainTab === "templates" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-500" />
                <span>Cấu hình Mẫu In Mặc Định Cho Phân Hệ</span>
              </h3>
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">Áp dụng toàn hệ thống</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Cầm đồ */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 space-y-2">
                <label className="label text-slate-700 text-xs font-bold py-0 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Hợp đồng Cầm đồ</span>
                </label>
                <select
                  value={pawnTemplate}
                  onChange={(e) => setPawnTemplate(e.target.value)}
                  className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-xl text-xs font-medium"
                >
                  {getTemplatesByModule("pawn").map((t) => (
                    <option key={t.code} value={t.code}>[{t.code}] - {t.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">Mẫu in áp dụng khi nhấn nút In Hợp Đồng trên Cầm đồ.</p>
              </div>

              {/* 2. Tín chấp */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 space-y-2">
                <label className="label text-slate-700 text-xs font-bold py-0 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Hợp đồng Tín chấp</span>
                </label>
                <select
                  value={unsecuredTemplate}
                  onChange={(e) => setUnsecuredTemplate(e.target.value)}
                  className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-xl text-xs font-medium"
                >
                  {getTemplatesByModule("unsecured").map((t) => (
                    <option key={t.code} value={t.code}>[{t.code}] - {t.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">Mẫu in áp dụng khi nhấn nút In Hợp Đồng trên Tín chấp.</p>
              </div>

              {/* 3. Trả góp */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 space-y-2">
                <label className="label text-slate-700 text-xs font-bold py-0 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-500" />
                  <span>Hợp đồng Trả góp</span>
                </label>
                <select
                  value={installmentTemplate}
                  onChange={(e) => setInstallmentTemplate(e.target.value)}
                  className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-xl text-xs font-medium"
                >
                  {getTemplatesByModule("installment").map((t) => (
                    <option key={t.code} value={t.code}>[{t.code}] - {t.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">Mẫu in kèm bảng lịch trình trả góp chi tiết.</p>
              </div>

              {/* 4. Góp vốn */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 space-y-2">
                <label className="label text-slate-700 text-xs font-bold py-0 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-sky-500" />
                  <span>Hợp đồng Góp vốn</span>
                </label>
                <select
                  value={capitalTemplate}
                  onChange={(e) => setCapitalTemplate(e.target.value)}
                  className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-xl text-xs font-medium"
                >
                  {getTemplatesByModule("capital").map((t) => (
                    <option key={t.code} value={t.code}>[{t.code}] - {t.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">Mẫu in hợp tác đầu tư nhận góp vốn.</p>
              </div>

              {/* 5. Phiếu thu */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 space-y-2">
                <label className="label text-slate-700 text-xs font-bold py-0 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Mẫu Phiếu Thu tiền</span>
                </label>
                <select
                  value={receiptTemplate}
                  onChange={(e) => setReceiptTemplate(e.target.value)}
                  className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-xl text-xs font-medium"
                >
                  {getTemplatesByModule("receipt").map((t) => (
                    <option key={t.code} value={t.code}>[{t.code}] - {t.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">Mẫu số 01-TT Thông tư 88/2021/TT-BTC (A4/A5) hoặc Mẫu in nhiệt K80 (80mm).</p>
              </div>

              {/* 6. Phiếu chi */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/30 space-y-2">
                <label className="label text-slate-700 text-xs font-bold py-0 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-500" />
                  <span>Mẫu Phiếu Chi tiền</span>
                </label>
                <select
                  value={paymentTemplate}
                  onChange={(e) => setPaymentTemplate(e.target.value)}
                  className="select select-bordered select-sm w-full bg-white border-slate-200 focus:outline-none focus:border-amber-500 text-slate-800 rounded-xl text-xs font-medium"
                >
                  {getTemplatesByModule("payment").map((t) => (
                    <option key={t.code} value={t.code}>[{t.code}] - {t.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">Mẫu số 02-TT Thông tư 88/2021/TT-BTC (A4/A5) hoặc Mẫu in nhiệt K80 (80mm).</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: THẺ BIẾN PLACEHOLDERS */}
        {activeMainTab === "placeholders" && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-500" />
                <span>Danh sách Thẻ Biến Chèn Vào Mẫu In (Placeholders)</span>
              </h3>
              <span className="text-xs text-slate-400">Nhấn vào ô để sao chép nhanh</span>
            </div>

            {/* Module Sub-Tabs */}
            <div className="flex flex-wrap gap-2 border-b pb-2">
              {[
                { id: "pawn", label: "Cầm đồ" },
                { id: "unsecured", label: "Tín chấp" },
                { id: "installment", label: "Trả góp" },
                { id: "capital", label: "Góp vốn" },
                { id: "receipt", label: "Phiếu Thu" },
                { id: "payment", label: "Phiếu Chi" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePlaceholderTab(tab.id as PrintModuleType)}
                  className={`btn btn-xs rounded-lg font-bold px-3 ${
                    activePlaceholderTab === tab.id
                      ? "bg-amber-500 text-slate-950 border-none"
                      : "btn-ghost text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Grid of placeholders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
              {MODULE_PLACEHOLDERS[activePlaceholderTab]?.map((item) => (
                <div 
                  key={item.key} 
                  onClick={() => handleCopyTag(item.key)}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-amber-50/50 hover:border-amber-200 transition-all cursor-pointer group"
                >
                  <div className="flex flex-col truncate pr-2">
                    <span className="font-mono text-xs font-bold text-amber-700 truncate">{`{{${item.key}}}`}</span>
                    <span className="text-[10px] text-slate-500 truncate">{item.label}</span>
                  </div>
                  <button type="button" className="text-slate-400 group-hover:text-amber-600 shrink-0">
                    {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="border-t pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary text-slate-950 bg-amber-500 hover:bg-amber-600 border-none btn-sm gap-1.5 rounded-xl font-bold px-8 py-2 h-auto shadow-md shadow-amber-500/20"
          >
            {loading ? <span className="loading loading-spinner btn-xs"></span> : <Save className="w-4 h-4" />}
            <span>Lưu tất cả cấu hình & mẫu in</span>
          </button>
        </div>
      </form>
    </div>
  );
};
