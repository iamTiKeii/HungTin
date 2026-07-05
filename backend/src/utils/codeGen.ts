import { Prisma } from "@prisma/client";

export async function generateVoucherCode(
  tx: Prisma.TransactionClient,
  type: "receipt" | "payment"
): Promise<string> {
  const prefix = type === "receipt" ? "PT" : "PC";
  let count = 0;
  if (type === "receipt") {
    count = await tx.receiptVoucher.count();
  } else {
    count = await tx.paymentVoucher.count();
  }
  
  // Pad with 0 for at least 4 digits, but let it grow naturally
  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}${seq}`;
}

export async function generateContractCode(
  tx: Prisma.TransactionClient,
  type: "pawn" | "unsecured" | "installment"
): Promise<string> {
  let prefix = "HD";
  let count = 0;

  if (type === "pawn") {
    prefix = "HD";
    count = await tx.pawnContract.count();
  } else if (type === "unsecured") {
    prefix = "TC";
    count = await tx.unsecuredContract.count();
  } else {
    prefix = "TG";
    count = await tx.installmentContract.count();
  }

  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}${seq}`;
}
