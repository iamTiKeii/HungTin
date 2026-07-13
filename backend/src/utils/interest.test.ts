import { InterestCalculatorFactory, normalizeNumericInput } from "./interest";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`\x1b[31m[FAIL] ${message}\x1b[0m`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function runTests() {
  console.log("==================================================");
  console.log("RUNNING INTEREST CALCULATOR UNIT TESTS (INPUT NORMALIZATION)");
  console.log("==================================================");

  // 1. Test Input Normalizer utility directly
  {
    console.log("Testing normalizeNumericInput utility...");
    assert(normalizeNumericInput(1.4) === 1.4, "Number standard failed");
    assert(normalizeNumericInput("1.4") === 1.4, "String dot failed");
    assert(normalizeNumericInput("1,4") === 1.4, "String comma failed");
    assert(normalizeNumericInput("  1,4%  ") === 1.4, "String percentage and spaces failed");
    assert(normalizeNumericInput("abc") === 0, "String invalid garbage failed");
    assert(normalizeNumericInput(null) === 0, "Null failed");
    assert(normalizeNumericInput(undefined) === 0, "Undefined failed");
  }

  // 2. Test Case 1 & 2: DailyPerMillionInterestCalculator with dot and comma formatting
  {
    console.log("Testing DailyPerMillionInterestCalculator with dot and comma...");
    const calc = InterestCalculatorFactory.getCalculator("daily_k_million");

    // Dot formatting "3.5"
    const resDot = calc.calculate({
      loanAmount: "20000000",
      interestRate: "3.5",
      loanDays: "10",
      periodValue: "10",
      loanDateInput: "2026-07-01",
      isUpfront: false,
    });
    // Lãi = (20,000,000 / 1,000,000) * 3500 * 10 = 20 * 3500 * 10 = 700.000
    assert(resDot.schedule[0].interest === 700000, "DailyPerMillion dot string calculation failed");

    // Comma formatting "3,5"
    const resComma = calc.calculate({
      loanAmount: "20000000",
      interestRate: "3,5",
      loanDays: "10",
      periodValue: "10",
      loanDateInput: "2026-07-01",
      isUpfront: false,
    });
    assert(resComma.schedule[0].interest === 700000, "DailyPerMillion comma string calculation failed");
  }

  // 3. Test Case 3: Integer inputs
  {
    console.log("Testing calculators with integer inputs...");
    const calc = InterestCalculatorFactory.getCalculator("daily_k_million");
    const resInt = calc.calculate({
      loanAmount: 20000000,
      interestRate: 3,
      loanDays: 10,
      periodValue: 10,
      loanDateInput: "2026-07-01",
      isUpfront: false,
    });
    assert(resInt.schedule[0].interest === 600000, "DailyPerMillion integer calculation failed");
  }

  // 4. Test Case 4: Edge cases (0% interest, large amount, odd periods)
  {
    console.log("Testing edge cases (0% interest, large amount, odd periods)...");
    const calc = InterestCalculatorFactory.getCalculator("daily_k_million");

    // 0% interest
    const resZero = calc.calculate({
      loanAmount: 10000000,
      interestRate: "0",
      loanDays: 30,
      periodValue: 10,
      loanDateInput: "2026-07-01",
      isUpfront: false,
    });
    assert(resZero.totalInterestPayable === 0, "daily_k_million 0% interest failed");

    // Large amount (10 Billion)
    const resLarge = calc.calculate({
      loanAmount: 10000000000,
      interestRate: "2",
      loanDays: 5,
      periodValue: 5,
      loanDateInput: "2026-07-01",
      isUpfront: false,
    });
    assert(resLarge.totalInterestPayable === 100000000, "daily_k_million large amount interest failed");

    // Odd periods (12 days with period value 5)
    const resOdd = calc.calculate({
      loanAmount: 20000000,
      interestRate: "3",
      loanDays: "12",
      periodValue: "5",
      loanDateInput: "2026-07-01",
      isUpfront: false,
    });
    // Expected cycles: 3 cycles. 
    // Cycle 1: 5 days -> 20 * 3000 * 5 = 300.000
    // Cycle 2: 5 days -> 20 * 3000 * 5 = 300.000
    // Cycle 3: 2 days -> 20 * 3000 * 2 = 120.000
    // Total = 720.000
    assert(resOdd.schedule.length === 3, "Odd days cycle splitting failed");
    assert(resOdd.schedule[2].expected_days === 2, "Last cycle day count incorrect");
    assert(resOdd.schedule[2].interest === 120000, "Last cycle interest calculation incorrect");
    assert(resOdd.totalInterestPayable === 720000, "Odd days total interest incorrect");
  }

  // 5. Test EMI with comma formatting
  {
    console.log("Testing EMI Reducing Balance with comma formatting...");
    const calc = InterestCalculatorFactory.getCalculator("reducing_balance_fixed_installment");
    const resComma = calc.calculate({
      loanAmount: "100000000",
      interestRate: "1,5", // 1.5% per period
      loanDays: "90", // 3 periods
      periodValue: "30",
      loanDateInput: "2026-07-01",
      isUpfront: false,
    });
    // Total principal should be exactly 100M, ending balance should be 0.
    const sumPrincipal = resComma.schedule.reduce((sum, item) => sum + item.principal, 0);
    assert(sumPrincipal === 100000000, "EMI total principal sum failed");
    assert(resComma.schedule[2].endingBalance === 0, "EMI final cycle ending balance should be 0");
  }

  console.log("\x1b[32m[SUCCESS] ALL FINANCIAL STRATEGY INPUT NORMALIZATION TESTS PASSED!\x1b[0m");
  console.log("==================================================");
}

runTests();
