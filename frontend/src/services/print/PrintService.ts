import {
  buildPawnContractPrintData,
  buildLoanContractPrintData,
  buildInstallmentPrintData,
  buildCapitalContractPrintData,
  buildVoucherPrintData,
} from "./DataMapper";
import {
  renderTemplate,
  getDefaultTemplateCode,
  type PrintModuleType,
} from "./PrintTemplateManager";

export interface PrintOptions {
  isNegotiated?: boolean;
  templateCode?: string;
}

/**
 * High-level service to retrieve compiled print templates for any contract or voucher type.
 */
export const getCompiledHtml = (
  module: PrintModuleType,
  dataObj: any,
  store: any,
  options?: PrintOptions
): string => {
  // Fetch active template selection from options, localStorage, or fallback to default configuration
  let templateCode = options?.templateCode;
  if (!templateCode) {
    const storageKey = `${module}_print_template`;
    templateCode = localStorage.getItem(storageKey) || getDefaultTemplateCode(module);
  }

  // Map database data objects to standard template keys
  let mappedData: Record<string, string> = {};
  if (module === "pawn") {
    mappedData = buildPawnContractPrintData(dataObj, store, options?.isNegotiated);
  } else if (module === "unsecured") {
    mappedData = buildLoanContractPrintData(dataObj, store);
  } else if (module === "installment") {
    mappedData = buildInstallmentPrintData(dataObj, store);
  } else if (module === "capital") {
    mappedData = buildCapitalContractPrintData(dataObj, store);
  } else if (module === "receipt" || module === "payment") {
    mappedData = buildVoucherPrintData(dataObj, store);
  }

  // Compile and return final HTML content
  return renderTemplate(templateCode, mappedData);
};
