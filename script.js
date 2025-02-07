document.addEventListener("DOMContentLoaded", () => {
    const calculateBtn = document.getElementById("calculate-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const resultsDiv = document.getElementById("results");
    const absoluteIncrease = document.getElementById("absolute-increase");
    const percentageGrowth = document.getElementById("percentage-growth");
    const prevYearlySalary = document.getElementById("prev-yearly-salary");
    const newYearlySalary = document.getElementById("new-yearly-salary");
    let salaryChart;
    let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;

    // Apply saved theme
    document.body.classList.toggle("dark-mode", darkMode);
    themeToggle.classList.toggle("active", darkMode);

    // Theme toggle functionality
    themeToggle.addEventListener("click", () => {
        darkMode = !darkMode;
        document.body.classList.toggle("dark-mode", darkMode);
        themeToggle.classList.toggle("active", darkMode);
        localStorage.setItem("darkMode", JSON.stringify(darkMode));
        if (salaryChart) updateChartTheme();
    });

    calculateBtn.addEventListener("click", () => {
        const baseSalary = parseFloat(document.getElementById("base-salary").value);
        const targetSalary = parseFloat(document.getElementById("target-salary").value);

        if (isNaN(baseSalary) || isNaN(targetSalary)) {
            showError();
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

        hideError();

        resultsDiv.classList.remove("hidden");
        resultsDiv.classList.add("show");

        if (salaryChart) {
            salaryChart.destroy();
        }

        const ctx = document.getElementById("salary-chart").getContext("2d");
        const backgroundColors = darkMode ? ["#4a5568", "#6366f1"] : ["#667eea", "#90cdf4"];
        salaryChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Previous Yearly Salary", "After Increase"],
                datasets: [{
                    label: "Yearly Salary ($)",
                    data: [prevYearly, newYearly],
                    backgroundColor: backgroundColors,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: darkMode ? "#d0d5dd" : "#2d3748"
                        }
                    }
                }
            }
        });
    });

    function showError() {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.classList.remove('hidden');

        document.querySelectorAll('.results h2, .results p, .results canvas').forEach(el => {
            el.classList.add('result-hidden');
        });
    }

    function hideError() {
        const errorMessage = document.querySelector('.error-message');
        errorMessage.classList.add('hidden');

        document.querySelectorAll('.results h2, .results p, .results canvas').forEach(el => {
            el.classList.remove('result-hidden');
        });
    }

    function updateChartTheme() {
        if (!salaryChart) return;
        const newBackgroundColors = darkMode ? ["#4a5568", "#6366f1"] : ["#667eea", "#90cdf4"];
        salaryChart.data.datasets[0].backgroundColor = newBackgroundColors;
        salaryChart.options.scales.y.ticks.color = darkMode ? "#d0d5dd" : "#2d3748";
        salaryChart.update();
    }
});