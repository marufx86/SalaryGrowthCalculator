document.addEventListener("DOMContentLoaded", () => {
    const calculateBtn = document.getElementById("calculate-btn");
    const themeToggle = document.getElementById("theme-toggle");
    const resultsDiv = document.getElementById("results");
    const absoluteIncrease = document.getElementById("absolute-increase");
    const percentageGrowth = document.getElementById("percentage-growth");
    const prevYearlySalary = document.getElementById("prev-yearly-salary");
    const newYearlySalary = document.getElementById("new-yearly-salary");
    let salaryChart;
    let projectionChart;
    let darkMode = JSON.parse(localStorage.getItem("darkMode")) || true;

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
        if (projectionChart) updateProjectionTheme();
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
                labels: ["Current Yearly Salary", "Target Yearly Salary"],
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

        // Projection calculation
        const projectedYearlySalaries = [];
        let currentYearly = newYearly;
        const annualRaise = percentageIncrease; // Use calculated raise percentage
        for (let year = 1; year <= 10; year++) {
            currentYearly *= (1 + annualRaise / 100);
            projectedYearlySalaries.push(currentYearly);
        }

        // Create projection chart
        const projectionCtx = document.getElementById("projection-chart").getContext("2d");
        if (projectionChart) {
            projectionChart.destroy();
        }
        projectionChart = new Chart(projectionCtx, {
            type: "line",
            data: {
                labels: Array.from({length: 10}, (_, i) => i + 1),
                datasets: [{
                    label: "Projected Yearly Salary ($)",
                    data: projectedYearlySalaries,
                    borderColor: darkMode ? "#6366f1" : "#667eea",
                    backgroundColor: darkMode ? "#4a5568" : "#edf2f7",
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 1000
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: "Years"
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: "Yearly Salary ($)"
                        },
                        beginAtZero: false,
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

    function updateProjectionTheme() {
        if (!projectionChart) return;
        projectionChart.data.datasets[0].borderColor = darkMode ? "#6366f1" : "#667eea";
        projectionChart.data.datasets[0].backgroundColor = darkMode ? "#4a5568" : "#edf2f7";
        projectionChart.options.scales.x.title.text = "Years";
        projectionChart.options.scales.y.title.text = "Yearly Salary ($)";
        projectionChart.options.scales.y.ticks.color = darkMode ? "#d0d5dd" : "#2d3748";
        projectionChart.update();
    }
});