import React from "react";

export interface InterestSectionProps {
  state: any;
  onChange: (updates: any) => void;
  interestTypes: any[];
  config: any;
}

export const ContractInterestSection: React.FC<InterestSectionProps> = ({
  state,
  onChange,
  interestTypes,
  config,
}) => {
  const labelClass =
    "w-[125px] text-right pr-4 font-bold text-slate-700 shrink-0 text-xs select-none";

  if (config.type === "capital") {
    return (
      <div className="pt-4 border-t border-slate-100 space-y-4">
        <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
          III. THÔNG TIN LÃI SUẤT
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Interest Type */}
          <div className="flex items-center">
            <label className={labelClass}>Lãi suất</label>
            <div className="grow">
              <select
                value={state.interestType}
                onChange={(e) => onChange({ interestType: e.target.value })}
                className="select select-bordered select-sm w-full max-w-[220px] bg-white border-slate-200 rounded-lg text-slate-850 font-semibold focus:outline-none"
              >
                <option value="">-- Chọn hình thức lãi --</option>
                {interestTypes.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t border-slate-100 space-y-4">
      <h4 className="font-bold text-slate-800 text-xs border-b border-slate-100 pb-2">
        III. THÔNG TIN LÃI SUẤT & PHÍ
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {/* Interest Calculator Option */}
        <div className="flex items-center">
          <label className={labelClass}>
            Hình thức lãi <span className="text-red-500">*</span>
          </label>
          <div className="grow">
            <select
              value={state.interestType}
              onChange={(e) => onChange({ interestType: e.target.value })}
              className="select select-bordered select-sm w-full max-w-[220px] bg-white border-slate-200 rounded-lg text-slate-850 font-semibold focus:outline-none"
              required
            >
              <option value="">-- Chọn hình thức --</option>
              {interestTypes.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upfront interest checkbox */}
        {config.allowUpfrontInterest && (
          <div className="flex items-center">
            <div className="grow">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600 select-none text-xs">
                <input
                  type="checkbox"
                  checked={state.isUpfrontInterest}
                  onChange={(e) =>
                    onChange({ isUpfrontInterest: e.target.checked })
                  }
                  className="checkbox checkbox-sm checkbox-primary border-slate-300 rounded checked:bg-blue-600 checked:border-blue-600 focus:outline-none"
                />
                <span>Thu lãi trước</span>
              </label>
            </div>
          </div>
        )}

        {/* Interest Period */}
        <div className="flex items-center">
          <label className={labelClass}>
            Kỳ lãi <span className="text-red-500">*</span>
          </label>
          <div className="grow">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white w-full max-w-[220px] h-8">
              <input
                type="number"
                placeholder="10"
                value={state.interestPeriod}
                onChange={(e) =>
                  onChange({ interestPeriod: Number(e.target.value) })
                }
                className="grow px-3 text-slate-855 h-full font-bold focus:outline-none bg-white text-left text-xs border-none"
                required
              />
              <span className="bg-slate-50 text-slate-400 px-3 h-full flex items-center border-l border-slate-200 text-[10px] font-bold shrink-0 select-none">
                Ngày
              </span>
            </div>
          </div>
        </div>

        {/* Periodic Help Note */}
        <div className="flex items-center">
          <span className="text-slate-400 text-xs italic font-semibold select-none">
            (VD : 10 ngày đóng lãi 1 lần thì điền số 10)
          </span>
        </div>

        {/* Interest Rate */}
        <div className="flex items-start">
          <label className={`${labelClass} mt-1.5`}>
            Lãi phí <span className="text-red-500">*</span>
          </label>
          <div className="grow">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white w-full max-w-[220px] h-8">
              <input
                type="number"
                step="0.01"
                placeholder="1"
                value={state.interestRate}
                onChange={(e) =>
                  onChange({ interestRate: Number(e.target.value) })
                }
                className="grow px-3 text-slate-850 h-full font-bold focus:outline-none bg-white text-left text-xs border-none"
                required
              />
              <span className="bg-slate-50 text-slate-400 px-3 h-full flex items-center border-l border-slate-200 text-[10px] font-bold shrink-0 select-none">
                k/1 triệu
              </span>
            </div>
          </div>
        </div>

        {/* legal disclaimer warning block */}
        <div className="flex items-start">
          <span className="text-red-500 text-[10px] leading-relaxed font-semibold block grow mt-0.5 max-w-md select-none">
            * Lưu ý: Khách hàng phải đảm bảo lãi suất + phí khi cho vay tuân thủ
            quy định pháp luật. Lãi suất cho vay &gt;=100%/năm là vi phạm pháp
            luật, có thể bị truy cứu trách nhiệm hình sự theo Điều 201 Bộ luật
            Hình sự.
          </span>
        </div>
      </div>
    </div>
  );
};
