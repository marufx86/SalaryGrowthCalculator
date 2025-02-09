document.addEventListener("DOMContentLoaded", () => {
  const calculateBtn = document.getElementById("calculate-btn");
  const themeToggle = document.getElementById("theme-toggle");
  const resultsDiv = document.getElementById("results");
  const absoluteIncrease = document.getElementById("absolute-increase");
  const percentageGrowth = document.getElementById("percentage-growth");
  const prevYearlySalary = document.getElementById("prev-yearly-salary");
  const newYearlySalary = document.getElementById("new-yearly-salary");
  const newYearlySalaryInflation = document.getElementById("new-yearly-salary-inflation");
  const careerAdviceEl = document.getElementById("career-advice");
  let salaryChart;
  let projectionChart;
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

    // Determine tick font size based on screen width for better readability
    const tickFontSize = window.innerWidth < 600 ? 12 : 14;

    // Analysis calculations
    const absoluteDiff = targetSalary - baseSalary;
    const raisePercentage = (absoluteDiff / baseSalary) * 100;
    const prevYearly = baseSalary * 12;
    const newYearlyVal = targetSalary * 12;
    // Calculate inflation-adjusted yearly salary for one year
    const newYearlyInflationVal = newYearlyVal / (1 + inflationRate / 100);

    absoluteIncrease.textContent = `$${absoluteDiff.toFixed(2)}`;
    percentageGrowth.textContent = `${raisePercentage.toFixed(1)}%`;
    prevYearlySalary.textContent = `$${prevYearly.toFixed(2)}`;
    newYearlySalary.textContent = `$${newYearlyVal.toFixed(2)}`;
    newYearlySalaryInflation.textContent = `$${newYearlyInflationVal.toFixed(2)}`;

    // --- Career Growth Advice (Alternative) ---
    // Calculate the real (inflation-adjusted) growth percentage between your previous and new salaries.
    // This shows how much your purchasing power has actually increased.
    const realIncreasePercentage = ((newYearlyInflationVal / prevYearly) - 1) * 100;
    // Provide advice based on the real increase:
    if (realIncreasePercentage < 5) {
      careerAdviceEl.textContent = `Your nominal raise is ${raisePercentage.toFixed(1)}%, but after accounting for inflation, your real increase is only ${realIncreasePercentage.toFixed(1)}%. This suggests that inflation is eroding your gains. Consider negotiating a higher raise or investing in upskilling to secure better compensation.`;
    } else {
      careerAdviceEl.textContent = `Great work! Your nominal raise of ${raisePercentage.toFixed(1)}% translates into an inflation-adjusted increase of ${realIncreasePercentage.toFixed(1)}%, ensuring a meaningful boost to your purchasing power. Continue investing in your professional growth.`;
    }
    // --- End Career Growth Advice ---

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
          data: [prevYearly, newYearlyVal],
          backgroundColor: backgroundColors,
          borderRadius: 6,
          maxBarThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: tickFontSize },
              color: darkMode ? "#d0d5dd" : "#2d3748"
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { size: tickFontSize }
            }
          }
        }
      }
    });

    // Projection calculation for 10 years (compound growth and inflation adjustment)
    const projectedYearlySalaries = [];
    const projectedRealSalaries = [];
    let currentNominalSalary = newYearlyVal;
    // Here we compound the new salary by the same raise percentage each year.
    for (let year = 1; year <= 10; year++) {
      currentNominalSalary *= (1 + raisePercentage / 100);
      projectedYearlySalaries.push(currentNominalSalary);
      // Discount the nominal salary by the cumulative inflation factor for that year.
      const realSalary = currentNominalSalary / Math.pow(1 + inflationRate / 100, year);
      projectedRealSalaries.push(realSalary);
    }

    // Create or update the projection chart (line chart) with both datasets
    if (projectionChart) {
      projectionChart.destroy();
    }
    const projectionCtx = document.getElementById("projection-chart").getContext("2d");
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
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "Inflation Adjusted Salary ($)",
            data: projectedRealSalaries,
            borderColor: darkMode ? "#e53e3e" : "#f56565",
            backgroundColor: darkMode ? "#c53030" : "#feb2b2",
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Years",
              font: { size: tickFontSize }
            },
            ticks: {
              font: { size: tickFontSize },
              color: darkMode ? "#d0d5dd" : "#2d3748"
            }
          },
          y: {
            title: {
              display: true,
              text: "Yearly Salary ($)",
              font: { size: tickFontSize }
            },
            beginAtZero: false,
            ticks: {
              font: { size: tickFontSize },
              color: darkMode ? "#d0d5dd" : "#2d3748"
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              font: { size: tickFontSize }
            }
          }
        }
      }
    });
  });

  function showError() {
    const errorMessage = document.querySelector('.error-message');
    errorMessage.classList.remove('hidden');
    document.querySelectorAll('.results h2, .results p, .chart-container').forEach(el => {
      el.classList.add('result-hidden');
    });
  }

  function hideError() {
    const errorMessage = document.querySelector('.error-message');
    errorMessage.classList.add('hidden');
    document.querySelectorAll('.results h2, .results p, .chart-container').forEach(el => {
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
    projectionChart.data.datasets[1].borderColor = darkMode ? "#e53e3e" : "#f56565";
    projectionChart.data.datasets[1].backgroundColor = darkMode ? "#c53030" : "#feb2b2";
    projectionChart.options.scales.x.title.text = "Years";
    projectionChart.options.scales.y.title.text = "Yearly Salary ($)";
    projectionChart.options.scales.y.ticks.color = darkMode ? "#d0d5dd" : "#2d3748";
    projectionChart.update();
  }
});
