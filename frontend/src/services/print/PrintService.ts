import {
  buildPawnContractPrintData,
  buildLoanContractPrintData,
  buildInstallmentPrintData,
} from "./DataMapper";
import { renderTemplate, getDefaultTemplateCode } from "./PrintTemplateManager";

export interface PrintOptions {
  isNegotiated?: boolean;
}

/**
 * High-level service to retrieve compiled print templates for any contract type.
 */
export const getCompiledHtml = (
  module: "pawn" | "unsecured" | "installment",
  contract: any,
  store: any,
  options?: PrintOptions
): string => {
  // Fetch active template selection from storage or fallback to default configuration
  let templateCode = "";
  if (module === "pawn") {
    templateCode = localStorage.getItem("pawn_print_template") || getDefaultTemplateCode("pawn");
  } else if (module === "unsecured") {
    templateCode = localStorage.getItem("unsecured_print_template") || getDefaultTemplateCode("unsecured");
  } else if (module === "installment") {
    templateCode = localStorage.getItem("installment_print_template") || getDefaultTemplateCode("installment");
  } else {
    templateCode = getDefaultTemplateCode(module);
  }

  // Map database data objects to standard template keys
  let mappedData: Record<string, string> = {};
  if (module === "pawn") {
    mappedData = buildPawnContractPrintData(contract, store, options?.isNegotiated);
  } else if (module === "unsecured") {
    mappedData = buildLoanContractPrintData(contract, store);
  } else if (module === "installment") {
    mappedData = buildInstallmentPrintData(contract, store);
  }

  // Compile and return final HTML content
  return renderTemplate(templateCode, mappedData);
};
