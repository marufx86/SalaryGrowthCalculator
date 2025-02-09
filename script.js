document.addEventListener("DOMContentLoaded", () => {
  const calculateBtn = document.getElementById("calculate-btn");
  const themeToggle = document.getElementById("theme-toggle");
  const resultsDiv = document.getElementById("results");
  const absoluteIncrease = document.getElementById("absolute-increase");
  const percentageGrowth = document.getElementById("percentage-growth");
  const prevYearlySalary = document.getElementById("prev-yearly-salary");
  const newYearlySalary = document.getElementById("new-yearly-salary");
  const newYearlySalaryInflation = document.getElementById("new-yearly-salary-inflation");
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
    let inflationRate = parseFloat(document.getElementById("inflation-rate").value);
    if (isNaN(inflationRate)) inflationRate = 0;

    if (isNaN(baseSalary) || isNaN(targetSalary)) {
      showError();
      return;
    }

    const absoluteDiff = targetSalary - baseSalary;
    const raisePercentage = (absoluteDiff / baseSalary) * 100;
    const prevYearly = baseSalary * 12;
    const newYearly = targetSalary * 12;
    // Calculate inflation-adjusted yearly salary (for one year)
    const newYearlyInflation = newYearly / (1 + inflationRate / 100);

    absoluteIncrease.textContent = `$${absoluteDiff.toFixed(2)}`;
    percentageGrowth.textContent = `${raisePercentage.toFixed(1)}%`;
    prevYearlySalary.textContent = `$${prevYearly.toFixed(2)}`;
    newYearlySalary.textContent = `$${newYearly.toFixed(2)}`;
    newYearlySalaryInflation.textContent = `$${newYearlyInflation.toFixed(2)}`;

    hideError();

    resultsDiv.classList.remove("hidden");
    resultsDiv.classList.add("show");

    // Create or update the salary chart (bar chart)
    if (salaryChart) {
      salaryChart.destroy();
    }
    const salaryCtx = document.getElementById("salary-chart").getContext("2d");
    const backgroundColors = darkMode ? ["#4a5568", "#6366f1"] : ["#667eea", "#90cdf4"];
    salaryChart = new Chart(salaryCtx, {
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

    // Projection calculation for 10 years
    const projectedYearlySalaries = [];
    const projectedRealSalaries = [];
    let currentNominalSalary = newYearly;
    const annualRaise = raisePercentage; // Using the calculated raise percentage

    for (let year = 1; year <= 10; year++) {
      currentNominalSalary *= (1 + annualRaise / 100);
      projectedYearlySalaries.push(currentNominalSalary);
      // Calculate the inflation-adjusted (real) salary for this year:
      const realSalary = currentNominalSalary / Math.pow(1 + inflationRate / 100, year);
      projectedRealSalaries.push(realSalary);
    }

    // Create or update the projection chart (line chart) with both datasets
    const projectionCtx = document.getElementById("projection-chart").getContext("2d");
    if (projectionChart) {
      projectionChart.destroy();
    }
    projectionChart = new Chart(projectionCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: 10 }, (_, i) => i + 1),
        datasets: [
          {
            label: "Projected Yearly Salary (Nominal) ($)",
            data: projectedYearlySalaries,
            borderColor: darkMode ? "#6366f1" : "#667eea",
            backgroundColor: darkMode ? "#4a5568" : "#edf2f7",
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7
          },
          {
            label: "Inflation Adjusted Salary ($)",
            data: projectedRealSalaries,
            borderColor: darkMode ? "#e53e3e" : "#f56565",
            backgroundColor: darkMode ? "#c53030" : "#feb2b2",
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
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
    // Update the nominal salary dataset
    projectionChart.data.datasets[0].borderColor = darkMode ? "#6366f1" : "#667eea";
    projectionChart.data.datasets[0].backgroundColor = darkMode ? "#4a5568" : "#edf2f7";
    // Update the inflation-adjusted salary dataset
    projectionChart.data.datasets[1].borderColor = darkMode ? "#e53e3e" : "#f56565";
    projectionChart.data.datasets[1].backgroundColor = darkMode ? "#c53030" : "#feb2b2";
    projectionChart.options.scales.x.title.text = "Years";
    projectionChart.options.scales.y.title.text = "Yearly Salary ($)";
    projectionChart.options.scales.y.ticks.color = darkMode ? "#d0d5dd" : "#2d3748";
    projectionChart.update();
  }
});
