"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateVoucherCode = generateVoucherCode;
exports.generateContractCode = generateContractCode;
async function generateVoucherCode(tx, type) {
    const prefix = type === "receipt" ? "PT" : "PC";
    let count = 0;
    if (type === "receipt") {
        count = await tx.receiptVoucher.count();
    }
    else {
        count = await tx.paymentVoucher.count();
    }
    // Pad with 0 for at least 4 digits, but let it grow naturally
    const seq = String(count + 1).padStart(4, "0");
    return `${prefix}${seq}`;
}
async function generateContractCode(tx, type) {
    let prefix = "HD";
    let count = 0;
    if (type === "pawn") {
        prefix = "HD";
        count = await tx.pawnContract.count();
    }
    else if (type === "unsecured") {
        prefix = "TC";
        count = await tx.unsecuredContract.count();
    }
    else {
        prefix = "TG";
        count = await tx.installmentContract.count();
    }
    const seq = String(count + 1).padStart(4, "0");
    return `${prefix}${seq}`;
}
