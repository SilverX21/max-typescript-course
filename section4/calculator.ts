type InvestmentData = {
  initialAmount: number;
  annualContribution: number;
  expectedReturn: number;
  duration: number;
};

type InvestmentResult = {
  year: string;
  totalAmount: number;
  totalContributions: number;
  totalInterestEarned: number;
};

type CalculationResult = InvestmentResult[] | string;

function calculateInvestment(data: InvestmentData): CalculationResult {
  const { initialAmount, annualContribution, expectedReturn, duration } = data;

  if (initialAmount < 0) {
    return "Initial investment amount must be at least zero";
  }

  if (duration < 0) {
    return "No valid amount of years provided";
  }

  if (expectedReturn <= 0) {
    return "Expected result must be at least zero";
  }

  let total = initialAmount;
  let totalContributions = 0;
  let totalInterestEarned = 0;

  const annualResults: InvestmentResult[] = [];

  for (let i = 0; i < duration; i++) {
    total = total * (1 + expectedReturn);
    totalInterestEarned = total - totalContributions - initialAmount;
    totalContributions = totalContributions + annualContribution;
    total = total + annualContribution;

    annualResults.push({
      year: `Year ${i + 1}`,
      totalAmount: total,
      totalInterestEarned,
      totalContributions,
    });
  }

  return annualResults;
}

function printResults(results: CalculationResult) {
  if (typeof results === "string") {
    console.log(results);
    return;
  }

  for (const yearEndResult of results) {
    console.log("Year: ", yearEndResult.year);
    console.log("Total: ", yearEndResult.totalAmount.toFixed(0));
    console.log(
      "Total contributions: ",
      yearEndResult.totalContributions.toFixed(0),
    );
    console.log(
      "Total interest earned: ",
      yearEndResult.totalInterestEarned.toFixed(0),
    );
    console.log("--------------------");
  }
}

var investment: InvestmentData = {
  initialAmount: 1000,
  annualContribution: 2400,
  duration: 40,
  expectedReturn: 0.1,
};

const results = calculateInvestment(investment);
printResults(results);
