import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Seed Permissions
  const permissionsData = [
    { code: "STORES_MANAGE", name: "Quản lý Cửa hàng/Chi nhánh", category: "Hệ thống", description: "Xem, thêm, sửa, xóa các chi nhánh cửa hàng" },
    { code: "EMPLOYEES_MANAGE", name: "Quản lý Nhân viên & Phân quyền", category: "Hệ thống", description: "Quản lý hồ sơ nhân viên và gán danh mục quyền" },
    { code: "COLLABORATORS_MANAGE", name: "Quản lý Cộng tác viên", category: "Nghiệp vụ", description: "Xem, thêm, sửa, xóa cộng tác viên chuỗi" },
    { code: "CUSTOMERS_MANAGE", name: "Quản lý Khách hàng & Blacklist", category: "Nghiệp vụ", description: "Quản lý khách hàng, báo xấu khách hàng lên danh sách đen" },
    { code: "COMMODITIES_MANAGE", name: "Cấu hình Hàng hóa & Gói lãi", category: "Hệ thống", description: "Cấu hình danh mục tài sản, hạn mức và gói lãi mặc định" },
    { code: "FUNDS_MANAGE", name: "Quản lý Quỹ tiền mặt & Két tiền", category: "Tài chính", description: "Theo dõi số dư quỹ hiện tại, tiền đầu ngày, điều chỉnh quỹ két" },
    { code: "CONTRACTS_MANAGE", name: "Quản lý Hợp đồng (Lập/Hủy)", category: "Nghiệp vụ", description: "Lập mới và xóa bỏ các hợp đồng Cầm đồ, Tín chấp, Trả góp" },
    { code: "CONTRACTS_OPERATE", name: "Thực hiện Giao dịch Hợp đồng", category: "Nghiệp vụ", description: "Đóng lãi, trả gốc, vay thêm, gia hạn, tất toán, ghi nợ trên hợp đồng" },
    { code: "VOUCHERS_MANAGE", name: "Quản lý Thu Chi ngoài nghiệp vụ", category: "Tài chính", description: "Lập và quản lý các phiếu thu, phiếu chi chi phí vận hành" },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: { name: perm.name, category: perm.category, description: perm.description },
      create: perm,
    });
  }
  console.log("Permissions seeded.");

  // 2. Seed Interest Types
  const interestTypesData = [
    { code: "daily_k_million", name: "Lãi ngày (k/triệu)", calculation_method: "daily_k_million", is_principal_included: false, notes: "Lãi tính theo số tiền (k) trên 1 triệu đồng mỗi ngày" },
    { code: "daily_k_day", name: "Lãi ngày (k/ngày)", calculation_method: "daily_k_day", is_principal_included: false, notes: "Lãi tính cố định số tiền (k) mỗi ngày" },
    { code: "monthly_percent_30", name: "Lãi tháng (%) (30 ngày)", calculation_method: "monthly_percent_30", is_principal_included: false, notes: "Lãi tính theo tỷ lệ phần trăm mỗi tháng, coi 1 tháng có 30 ngày" },
    { code: "monthly_percent_periodic", name: "Lãi tháng (%) (Định kỳ)", calculation_method: "monthly_percent_periodic", is_principal_included: false, notes: "Lãi tính theo tỷ lệ phần trăm mỗi tháng, thanh toán cùng ngày hàng tháng" },
    { code: "monthly_amount_periodic", name: "Lãi tháng (VNĐ) (Định kỳ)", calculation_method: "monthly_amount_periodic", is_principal_included: false, notes: "Lãi tính cố định số tiền (VNĐ) mỗi tháng, thanh toán cùng ngày hàng tháng" },
    { code: "weekly_percent", name: "Lãi tuần (%)", calculation_method: "weekly_percent", is_principal_included: false, notes: "Lãi tính theo tỷ lệ phần trăm mỗi tuần" },
    { code: "weekly_amount", name: "Lãi tuần (VNĐ)", calculation_method: "weekly_amount", is_principal_included: false, notes: "Lãi tính cố định số tiền (VNĐ) mỗi tuần" },
    { code: "flat_rate_monthly", name: "Lãi phẳng (tháng)", calculation_method: "flat_rate_monthly", is_principal_included: true, notes: "Góp gốc lãi đều hàng tháng, lãi tính cố định theo gốc ban đầu" },
    { code: "flat_rate_daily", name: "Lãi phẳng (ngày)", calculation_method: "flat_rate_daily", is_principal_included: true, notes: "Góp gốc lãi đều hàng ngày, lãi tính cố định theo gốc ban đầu" },
    { code: "reducing_balance_fixed_installment", name: "Dư nợ giảm dần (Gốc lãi cố định)", calculation_method: "reducing_balance_fixed_installment", is_principal_included: true, notes: "Tổng số tiền đóng mỗi kỳ (gốc + lãi) cố định, lãi tính trên dư nợ thực tế giảm dần" },
    { code: "reducing_balance_fixed_principal", name: "Dư nợ giảm dần (Gốc cố định)", calculation_method: "reducing_balance_fixed_principal", is_principal_included: true, notes: "Số tiền gốc đóng mỗi kỳ cố định, lãi tính trên dư nợ thực tế giảm dần nên tổng tiền đóng giảm dần" },
  ];

  for (const it of interestTypesData) {
    await prisma.interestType.upsert({
      where: { code: it.code },
      update: { name: it.name, calculation_method: it.calculation_method, is_principal_included: it.is_principal_included, notes: it.notes },
      create: it,
    });
  }
  console.log("Interest types seeded.");

  // 3. Seed Income Categories
  const incomeCategoriesData = [
    { code: "thu_thanh_ly", name: "Thu thanh lý tài sản cũ" },
    { code: "thu_gop_von", name: "Thu góp vốn thêm của cổ đông" },
    { code: "thu_khac", name: "Thu nhập khác" },
  ];

  for (const ic of incomeCategoriesData) {
    await prisma.incomeCategory.upsert({
      where: { code: ic.code },
      update: { name: ic.name },
      create: ic,
    });
  }
  console.log("Income categories seeded.");

  // 4. Seed Expense Categories
  const expenseCategoriesData = [
    { code: "chi_luong", name: "Chi lương nhân viên" },
    { code: "chi_mat_bang", name: "Chi thuê mặt bằng cửa hàng" },
    { code: "chi_dien_nuoc", name: "Chi tiền điện, nước, internet" },
    { code: "chi_khac", name: "Chi phí hoạt động khác" },
  ];

  for (const ec of expenseCategoriesData) {
    await prisma.expenseCategory.upsert({
      where: { code: ec.code },
      update: { name: ec.name },
      create: ec,
    });
  }
  console.log("Expense categories seeded.");

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
