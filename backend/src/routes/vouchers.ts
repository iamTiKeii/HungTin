import { Router, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";
import { requirePermission } from "../middleware/permission";
import { generateVoucherCode } from "../utils/codeGen";
import { adjustDailyCash, normalizeToMidnight } from "../utils/cash";

const router = Router();
const prisma = new PrismaClient();

router.use(authenticateToken as any);

// 1. Get Categories
router.get("/categories/income", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cats = await prisma.incomeCategory.findMany({ orderBy: { name: "asc" } });
    return res.json(cats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/categories/expense", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cats = await prisma.expenseCategory.findMany({ orderBy: { name: "asc" } });
    return res.json(cats);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Get Receipts (PT) list
router.get("/receipts", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const receipts = await prisma.receiptVoucher.findMany({
      where: { store_id: req.user!.store_id },
      include: {
        category: true,
        employee: { select: { full_name: true } },
      },
      orderBy: { created_at: "desc" },
    });
    return res.json(receipts);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Get Payments (PC) list
router.get("/payments", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await prisma.paymentVoucher.findMany({
      where: { store_id: req.user!.store_id },
      include: {
        category: true,
        employee: { select: { full_name: true } },
      },
      orderBy: { created_at: "desc" },
    });
    return res.json(payments);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Create Receipt Voucher (PT)
router.post("/receipts", requirePermission(["VOUCHERS_MANAGE"]) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const storeId = req.user!.store_id;
    const employeeId = req.user!.id;
    const { category_id, amount, recipient_name, notes } = req.body;

    if (!category_id || !amount || !recipient_name || !notes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const value = Number(amount);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const code = await generateVoucherCode(tx, "receipt");
      const today = new Date();

      const voucher = await tx.receiptVoucher.create({
        data: {
          store_id: storeId,
          voucher_code: code,
          category_id,
          amount: value,
          recipient_name,
          notes,
          voucher_date: today,
          employee_id: employeeId,
          status: "active",
        },
      });

      // Update Daily Cash (+ amount)
      await adjustDailyCash(
        tx,
        storeId,
        today,
        value,
        "receipt_voucher",
        employeeId,
        `Thu tiền theo phiếu thu ${code}. Lý do: ${notes}`
      );

      return voucher;
    });

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. Create Payment Voucher (PC)
router.post("/payments", requirePermission(["VOUCHERS_MANAGE"]) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const storeId = req.user!.store_id;
    const employeeId = req.user!.id;
    const { category_id, amount, recipient_name, notes } = req.body;

    if (!category_id || !amount || !recipient_name || !notes) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const value = Number(amount);
    if (isNaN(value) || value <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const code = await generateVoucherCode(tx, "payment");
      const today = new Date();

      const voucher = await tx.paymentVoucher.create({
        data: {
          store_id: storeId,
          voucher_code: code,
          category_id,
          amount: value,
          recipient_name,
          notes,
          voucher_date: today,
          employee_id: employeeId,
          status: "active",
        },
      });

      // Update Daily Cash (- amount)
      await adjustDailyCash(
        tx,
        storeId,
        today,
        -value,
        "payment_voucher",
        employeeId,
        `Chi tiền theo phiếu chi ${code}. Lý do: ${notes}`
      );

      return voucher;
    });

    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. Cancel Receipt Voucher (PT)
router.put("/receipts/:id/cancel", requirePermission(["VOUCHERS_MANAGE"]) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const employeeId = req.user!.id;

    const voucher = await prisma.receiptVoucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    if (voucher.status === "cancelled") {
      return res.status(400).json({ error: "Voucher is already cancelled" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.receiptVoucher.update({
        where: { id },
        data: { status: "cancelled" },
      });

      // Reverse Cash flow (- amount)
      await adjustDailyCash(
        tx,
        voucher.store_id,
        new Date(),
        -Number(voucher.amount),
        "receipt_cancelled",
        employeeId,
        `Hủy phiếu thu ${voucher.voucher_code}. Số tiền gốc thu: ${voucher.amount}`
      );

      return updated;
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. Cancel Payment Voucher (PC)
router.put("/payments/:id/cancel", requirePermission(["VOUCHERS_MANAGE"]) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const employeeId = req.user!.id;

    const voucher = await prisma.paymentVoucher.findUnique({
      where: { id },
    });

    if (!voucher) {
      return res.status(404).json({ error: "Voucher not found" });
    }

    if (voucher.status === "cancelled") {
      return res.status(400).json({ error: "Voucher is already cancelled" });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.paymentVoucher.update({
        where: { id },
        data: { status: "cancelled" },
      });

      // Reverse Cash flow (+ amount)
      await adjustDailyCash(
        tx,
        voucher.store_id,
        new Date(),
        Number(voucher.amount),
        "payment_cancelled",
        employeeId,
        `Hủy phiếu chi ${voucher.voucher_code}. Số tiền gốc chi: ${voucher.amount}`
      );

      return updated;
    });

    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 8. Delete Receipt
router.delete("/receipts/:id", requirePermission(["VOUCHERS_MANAGE"]) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const employeeId = req.user!.id;

    const voucher = await prisma.receiptVoucher.findUnique({ where: { id } });
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });

    await prisma.$transaction(async (tx) => {
      if (voucher.status === "active") {
        // Reverse Daily Cash flow since it was active
        await adjustDailyCash(
          tx,
          voucher.store_id,
          new Date(),
          -Number(voucher.amount),
          "receipt_deleted",
          employeeId,
          `Xóa phiếu thu active ${voucher.voucher_code}. Khấu trừ lại: ${voucher.amount}`
        );
      }
      await tx.receiptVoucher.delete({ where: { id } });
    });

    return res.json({ message: "Receipt voucher deleted" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 9. Delete Payment
router.delete("/payments/:id", requirePermission(["VOUCHERS_MANAGE"]) as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id;
    const employeeId = req.user!.id;

    const voucher = await prisma.paymentVoucher.findUnique({ where: { id } });
    if (!voucher) return res.status(404).json({ error: "Voucher not found" });

    await prisma.$transaction(async (tx) => {
      if (voucher.status === "active") {
        // Reverse Daily Cash flow since it was active
        await adjustDailyCash(
          tx,
          voucher.store_id,
          new Date(),
          Number(voucher.amount),
          "payment_deleted",
          employeeId,
          `Xóa phiếu chi active ${voucher.voucher_code}. Hoàn lại: ${voucher.amount}`
        );
      }
      await tx.paymentVoucher.delete({ where: { id } });
    });

    return res.json({ message: "Payment voucher deleted" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
