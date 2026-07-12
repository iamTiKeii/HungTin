import React from "react";

export interface FinanceSectionProps {
  state: any;
  onChange: (updates: any) => void;
  staffs: any[];
  collaborators: any[];
}

export const ContractFinanceSection: React.FC<FinanceSectionProps> = ({
  state,
  onChange,
  staffs,
  collaborators,
}) => {
  const labelClass =
    "w-[125px] text-right pr-4 font-bold text-slate-700 shrink-0 text-xs select-none";

  return (
    <div className="pt-4 border-t border-slate-100 space-y-4">
      <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
        IV. THÔNG TIN QUẢN LÝ & CHI BÁO
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {/* Staff collector selector */}
        <div className="flex items-center">
          <label className={labelClass}>Nhân viên thu</label>
          <div className="grow">
            <select
              value={state.staffId}
              onChange={(e) => onChange({ staffId: e.target.value })}
              className="select select-bordered select-sm w-full max-w-[220px] bg-white border-slate-200 rounded-lg text-slate-850 font-semibold focus:outline-none"
              required
            >
              <option value="">-- Chọn nhân viên --</option>
              {staffs.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Collaborator selector */}
        <div className="flex items-center">
          <label className={labelClass}>Cộng tác viên</label>
          <div className="grow">
            <select
              value={state.collaboratorId}
              onChange={(e) => onChange({ collaboratorId: e.target.value })}
              className="select select-bordered select-sm w-full max-w-[220px] bg-white border-slate-200 rounded-lg text-slate-850 font-semibold focus:outline-none"
            >
              <option value="">-- Chọn cộng tác viên --</option>
              {collaborators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
