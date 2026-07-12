import cdTemplate from "../../../templates/CD_01_001.html?raw";
import tcTemplate from "../../../templates/TC_01_001.html?raw";
import tgTemplate from "../../../templates/TG_01_001.html?raw";

export interface PrintTemplate {
  code: string;
  name: string;
  module: "pawn" | "unsecured" | "installment" | "capital" | "finance" | "customer";
  htmlContent: string;
}

const templates: PrintTemplate[] = [
  {
    code: "CD_01_001",
    name: "Hợp đồng cầm cố tài sản tiêu chuẩn",
    module: "pawn",
    htmlContent: cdTemplate,
  },
  {
    code: "TC_01_001",
    name: "Hợp đồng cho vay tín chấp tiêu dùng",
    module: "unsecured",
    htmlContent: tcTemplate,
  },
  {
    code: "TG_01_001",
    name: "Hợp đồng cho vay trả góp theo kỳ",
    module: "installment",
    htmlContent: tgTemplate,
  },
];

export const getTemplates = (): PrintTemplate[] => {
  return templates;
};

export const getTemplateByCode = (code: string): string => {
  const t = templates.find((item) => item.code === code);
  return t ? t.htmlContent : cdTemplate; // fallback to CD if unknown
};

export const getDefaultTemplateCode = (
  module: "pawn" | "unsecured" | "installment" | "capital" | "finance" | "customer"
): string => {
  switch (module) {
    case "pawn":
      return "CD_01_001";
    case "unsecured":
      return "TC_01_001";
    case "installment":
      return "TG_01_001";
    default:
      return "CD_01_001";
  }
};

// Render template by replacing placeholders using regex matching {{PlaceholderName}}
export const renderTemplate = (code: string, data: Record<string, string>): string => {
  let html = getTemplateByCode(code);

  // Replace placeholders
  Object.entries(data).forEach(([key, val]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    html = html.replace(regex, val);
  });

  // Special case: If installment contract and template does not have schedule table placeholder, append it before signatures
  if (code.startsWith("TG_") && data.PaymentScheduleTable && !html.includes("{{PaymentScheduleTable}}")) {
    const appendHtml = `
      <div class="section-title" style="margin-top: 20px;">BẢNG LỊCH TRÌNH ĐÓNG TIỀN TRẢ GÓP CHI TIẾT</div>
      ${data.PaymentScheduleTable}
    `;
    html = html.replace(
      '<div class="signatures">',
      `${appendHtml}\n    <div class="signatures">`
    );
  }

  return html;
};
