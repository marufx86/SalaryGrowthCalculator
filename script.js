document.addEventListener("DOMContentLoaded", () => {
    const calculateBtn = document.getElementById("calculate-btn");
    const resultsDiv = document.getElementById("results");
    const absoluteIncrease = document.getElementById("absolute-increase");
    const percentageGrowth = document.getElementById("percentage-growth");
    const prevYearlySalary = document.getElementById("prev-yearly-salary");
    const newYearlySalary = document.getElementById("new-yearly-salary");
    let salaryChart;

    calculateBtn.addEventListener("click", () => {
        const baseSalary = parseFloat(document.getElementById("base-salary").value);
        const targetSalary = parseFloat(document.getElementById("target-salary").value);

        if (isNaN(baseSalary) || isNaN(targetSalary)) {
            alert("Please enter valid salary figures.");
            return;
        }

        const absoluteDiff = targetSalary - baseSalary;
        const percentageIncrease = (absoluteDiff / baseSalary) * 100;
        const prevYearly = baseSalary * 12;
        const newYearly = targetSalary * 12;

        absoluteIncrease.textContent = `$${absoluteDiff.toFixed(2)}`;
        percentageGrowth.textContent = `${percentageIncrease.toFixed(1)}%`;
        prevYearlySalary.textContent = `$${prevYearly.toFixed(2)}`;
        newYearlySalary.textContent = `$${newYearly.toFixed(2)}`;

        resultsDiv.classList.remove("hidden");
        resultsDiv.classList.add("show");

        if (salaryChart) {
            salaryChart.destroy();
        }

        const ctx = document.getElementById("salary-chart").getContext("2d");
        salaryChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Previous Yearly Salary", "After Increase"],
                datasets: [{
                    label: "Yearly Salary ($)",
                    data: [prevYearly, newYearly],
                    backgroundColor: ["#667eea", "#90cdf4"],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
});
