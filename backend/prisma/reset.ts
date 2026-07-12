import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const transactionalTables = [
  "unsecured_contract_reminders",
  "unsecured_transaction_ledger",
  "unsecured_debt_reminders",
  "unsecured_contract_documents",
  "unsecured_interest_payments",
  "unsecured_contract_extensions",
  "unsecured_principal_transactions",
  "unsecured_contracts",
  "pawn_contract_reminders",
  "pawn_transaction_ledger",
  "pawn_debt_reminders",
  "pawn_contract_documents",
  "pawn_interest_payments",
  "pawn_contract_extensions",
  "pawn_principal_transactions",
  "pawn_contracts",
  "installment_contract_reminders",
  "installment_transaction_ledger",
  "installment_debt_reminders",
  "installment_contract_documents",
  "installment_interest_payments",
  "installment_contract_extensions",
  "installment_principal_transactions",
  "installment_contracts",
  "capital_transactions",
  "shareholders",
  "vouchers",
  "cash_handover_reports",
  "daily_cash_ledgers",
  "customers",
  "collaborators",
  "commodities",
  "warnings_reminders",
  "employee_permissions",
  "employees",
  "stores",
  "system_settings",
];

async function main() {
  console.log("==================================================");
  console.log("DỌN DẸP DỮ LIỆU & RESET HỆ THỐNG CHO KHÁCH HÀNG MỚI...");
  console.log("==================================================");

  // Clean all transactional tables
  for (const table of transactionalTables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
      console.log(`[OK] Đã xóa dữ liệu bảng: ${table}`);
    } catch (err: any) {
      // Fallback: delete raw query if truncate fails or cascade isn't fully supported
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM "${table}";`);
        console.log(`[WARN] Dùng DELETE thay thế cho bảng: ${table}`);
      } catch (innerErr: any) {
        console.log(`[ERROR] Không thể dọn dẹp bảng ${table}: ${innerErr.message}`);
      }
    }
  }

  console.log("\nKhởi tạo lại các thông tin cấu hình ban đầu...");

  // 1. Tạo Store mặc định
  const defaultStore = await prisma.store.create({
    data: {
      name: "Hùng Tín - Chi nhánh 1",
      address: "123 Đường chính, Hà Nội",
      phone: "0976862823",
      opening_date: new Date(),
    },
  });
  console.log(`[OK] Đã tạo chi nhánh mặc định: ${defaultStore.name}`);

  // 2. Tạo tài khoản Admin cao nhất
  const passwordHash = await bcrypt.hash("admin123", 10);
  const defaultAdmin = await prisma.employee.create({
    data: {
      store_id: defaultStore.id,
      username: "admin",
      password_hash: passwordHash,
      full_name: "Quản Trị Viên",
      phone: "0976862823",
      status: "active",
    },
  });
  console.log(`[OK] Đã tạo tài khoản quản trị admin/admin123`);

  // 3. Gán toàn bộ quyền cho tài khoản Admin
  const allPermissions = await prisma.permission.findMany();
  if (allPermissions.length > 0) {
    await prisma.employeePermission.createMany({
      data: allPermissions.map((perm) => ({
        employee_id: defaultAdmin.id,
        permission_id: perm.id,
      })),
    });
    console.log(`[OK] Đã gán tất cả ${allPermissions.length} quyền cho tài khoản admin`);
  }

  // 4. Tạo cấu hình hệ thống mặc định
  const defaultSettings = [
    { key: "system_name", value: "Hùng Tín" },
    { key: "system_hotline", value: "0976.862.823" },
    { key: "system_email", value: "support@hungtin.vn" },
  ];

  for (const setting of defaultSettings) {
    await prisma.systemSetting.create({
      data: setting,
    });
  }
  console.log("[OK] Đã khởi tạo cấu hình hệ thống mặc định");

  console.log("==================================================");
  console.log("RESET HỆ THỐNG THÀNH CÔNG!");
  console.log("Tài khoản đăng nhập quản trị mặc định:");
  console.log("Tên đăng nhập: admin");
  console.log("Mật khẩu: admin123");
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
