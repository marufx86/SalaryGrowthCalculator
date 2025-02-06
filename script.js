document.addEventListener("DOMContentLoaded", () => {
    const calculateBtn = document.getElementById("calculate-btn");
    const resultsDiv = document.getElementById("results");
    const absoluteIncrease = document.getElementById("absolute-increase");
    const percentageGrowth = document.getElementById("percentage-growth");
    const ctx = document.getElementById("growth-chart").getContext("2d");
    let growthChart;

    calculateBtn.addEventListener("click", () => {
        const baseSalary = parseFloat(document.getElementById("base-salary").value);
        const targetSalary = parseFloat(document.getElementById("target-salary").value);

        if (isNaN(baseSalary) || isNaN(targetSalary) || baseSalary <= 0 || targetSalary <= 0) {
            alert("Please enter valid salary figures.");
            return;
        }

        const difference = targetSalary - baseSalary;
        const growthRate = (difference / baseSalary) * 100;

        absoluteIncrease.textContent = `$${difference.toFixed(2)}`;
        percentageGrowth.textContent = `${growthRate.toFixed(1)}%`;

        resultsDiv.classList.remove("hidden");

        // Destroy previous chart instance if it exists
        if (growthChart) {
            growthChart.destroy();
        }

        // Create an animated bar chart
        growthChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Salary Growth"],
                datasets: [{
                    label: "Growth Percentage",
                    data: [growthRate],
                    backgroundColor: "#667eea",
                    borderRadius: 6,
                }]
            },
            options: {
                animation: {
                    duration: 1000
                },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    });
});
