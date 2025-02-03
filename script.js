document.addEventListener("DOMContentLoaded", () => {
  const calculateBtn = document.getElementById("calculate-btn");
  const resultsDiv = document.getElementById("results");
  const absoluteIncrease = document.getElementById("absolute-increase");
  const percentageGrowth = document.getElementById("percentage-growth");

  calculateBtn.addEventListener("click", () => {
    const baseSalary = parseFloat(document.getElementById("base-salary").value);
    const targetSalary = parseFloat(document.getElementById("target-salary").value);

    if (isNaN(baseSalary) || isNaN(targetSalary)) {
      alert("Please enter valid compensation figures.");
      return;
    }

    const difference = targetSalary - baseSalary;
    const growthRate = (difference / baseSalary) * 100;

    absoluteIncrease.textContent = `$${difference.toFixed(2)}`;
    percentageGrowth.textContent = `${growthRate.toFixed(1)}%`;

    resultsDiv.classList.remove("hidden");
  });
});