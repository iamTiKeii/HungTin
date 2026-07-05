"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInterestSchedule = generateInterestSchedule;
function generateInterestSchedule(loanAmount, interestRate, // rate percentage or fixed cash depending on type
loanDays, periodValue, interestTypeCode, loanDateInput, isUpfront) {
    const loanDate = new Date(loanDateInput);
    const totalCycles = Math.ceil(loanDays / periodValue);
    const cycles = [];
    let remainingPrincipal = loanAmount;
    for (let k = 1; k <= totalCycles; k++) {
        // 1. Calculate dates
        const cycleStart = new Date(loanDate);
        cycleStart.setDate(loanDate.getDate() + (k - 1) * periodValue);
        const cycleEnd = new Date(loanDate);
        // If it's the last cycle, make sure it matches the exact contract maturity
        if (k === totalCycles) {
            cycleEnd.setDate(loanDate.getDate() + loanDays);
        }
        else {
            cycleEnd.setDate(loanDate.getDate() + k * periodValue);
        }
        const expectedDays = Math.max(1, Math.round((cycleEnd.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24)));
        let expectedInterest = 0;
        let expectedPrincipal = 0;
        const rate = interestRate; // e.g. percent rate or amount
        switch (interestTypeCode) {
            case "daily_k_million":
                // rate is k per million per day. e.g. 2k/million/day = 0.002 of principal per day.
                expectedInterest = (remainingPrincipal / 1000000) * rate * expectedDays;
                break;
            case "daily_k_day":
                // rate is fixed cash amount per day
                expectedInterest = rate * expectedDays;
                break;
            case "monthly_percent_30":
                // rate is monthly percentage, 1 month = 30 days
                expectedInterest = remainingPrincipal * ((rate / 100) / 30) * expectedDays;
                break;
            case "monthly_percent_periodic":
                // rate is monthly percentage, flat for the cycle
                expectedInterest = remainingPrincipal * (rate / 100);
                break;
            case "monthly_amount_periodic":
                // rate is fixed cash amount per month cycle
                expectedInterest = rate;
                break;
            case "weekly_percent":
                // rate is weekly percentage, flat for the cycle
                expectedInterest = remainingPrincipal * (rate / 100);
                break;
            case "weekly_amount":
                // rate is fixed cash amount per week cycle
                expectedInterest = rate;
                break;
            case "flat_rate_monthly":
                // flat monthly interest and equal principal split
                expectedInterest = loanAmount * (rate / 100);
                expectedPrincipal = loanAmount / totalCycles;
                break;
            case "flat_rate_daily":
                // daily flat interest and equal principal split
                expectedInterest = loanAmount * (rate / 100) * expectedDays;
                expectedPrincipal = loanAmount / totalCycles;
                break;
            case "reducing_balance_fixed_installment": {
                // Equal monthly payment (Amortization): A = P * [r(1+r)^n] / [(1+r)^n - 1]
                const r = rate / 100;
                if (r === 0) {
                    expectedPrincipal = loanAmount / totalCycles;
                    expectedInterest = 0;
                }
                else {
                    const totalPayment = loanAmount *
                        ((r * Math.pow(1 + r, totalCycles)) / (Math.pow(1 + r, totalCycles) - 1));
                    expectedInterest = remainingPrincipal * r;
                    expectedPrincipal = totalPayment - expectedInterest;
                }
                break;
            }
            case "reducing_balance_fixed_principal":
                // Equal principal, interest on remaining principal
                expectedPrincipal = loanAmount / totalCycles;
                expectedInterest = remainingPrincipal * (rate / 100);
                break;
            default:
                break;
        }
        // Rounding to nearest VNĐ (integer)
        expectedInterest = Math.round(expectedInterest);
        expectedPrincipal = Math.round(expectedPrincipal);
        cycles.push({
            cycle_number: k,
            from_date: cycleStart,
            to_date: cycleEnd,
            expected_days: expectedDays,
            expected_interest: expectedInterest,
            expected_principal: expectedPrincipal,
        });
        // Update remaining principal for reducing balance methods
        if (interestTypeCode === "reducing_balance_fixed_installment" ||
            interestTypeCode === "reducing_balance_fixed_principal") {
            remainingPrincipal -= expectedPrincipal;
            if (remainingPrincipal < 0)
                remainingPrincipal = 0;
        }
    }
    // Adjust last cycle's principal to avoid rounding discrepancies
    const totalExpectedPrincipal = cycles.reduce((sum, c) => sum + c.expected_principal, 0);
    if (totalExpectedPrincipal > 0 && totalExpectedPrincipal !== loanAmount) {
        const diff = loanAmount - totalExpectedPrincipal;
        const lastCycle = cycles[cycles.length - 1];
        if (lastCycle) {
            lastCycle.expected_principal += diff;
            if (lastCycle.expected_principal < 0)
                lastCycle.expected_principal = 0;
        }
    }
    return cycles;
}
