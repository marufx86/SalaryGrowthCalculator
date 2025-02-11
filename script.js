// Initialize EmailJS
;(() => {
  emailjs.init("PublicAPI"); // Replace with your EmailJS public key
})();

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

  // Theme functionality
  document.body.classList.toggle("dark-mode", darkMode);
  themeToggle.classList.toggle("active", darkMode);

  themeToggle.addEventListener("click", () => {
    darkMode = !darkMode;
    document.body.classList.toggle("dark-mode", darkMode);
    themeToggle.classList.toggle("active", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (salaryChart) updateChartTheme();
    if (projectionChart) updateProjectionTheme();
  });

  // Calculations
  calculateBtn.addEventListener("click", () => {
    const baseSalary = parseFloat(document.getElementById("base-salary").value);
    const targetSalary = parseFloat(document.getElementById("target-salary").value);
    let inflationRate = parseFloat(document.getElementById("inflation-rate").value) || 0;

    if (isNaN(baseSalary) || isNaN(targetSalary)) {
      showError();
      return;
    }

    const absoluteDiff = targetSalary - baseSalary;
    const raisePercentage = (absoluteDiff / baseSalary) * 100;
    const prevYearly = baseSalary * 12;
    const newYearlyVal = targetSalary * 12;
    const newYearlyInflationVal = newYearlyVal / (1 + inflationRate / 100);

    // Update results
    absoluteIncrease.textContent = `$${absoluteDiff.toFixed(2)}`;
    percentageGrowth.textContent = `${raisePercentage.toFixed(1)}%`;
    prevYearlySalary.textContent = `$${prevYearly.toFixed(2)}`;
    newYearlySalary.textContent = `$${newYearlyVal.toFixed(2)}`;
    newYearlySalaryInflation.textContent = `$${newYearlyInflationVal.toFixed(2)}`;

    // Career advice
    const realIncreasePercentage = (newYearlyInflationVal / prevYearly - 1) * 100;
    careerAdviceEl.textContent = realIncreasePercentage < 5 ?
      `Your nominal raise is ${raisePercentage.toFixed(1)}%, but after inflation, real increase is ${realIncreasePercentage.toFixed(1)}%. Consider negotiating higher.` :
      `Great work! ${raisePercentage.toFixed(1)}% nominal raise, ${realIncreasePercentage.toFixed(1)}% real increase. Keep growing!`;

    hideError();
    resultsDiv.classList.remove("hidden");
    resultsDiv.classList.add("show");

    // Charts
    updateCharts(prevYearly, newYearlyVal, inflationRate, raisePercentage);
  });

  function updateCharts(prevYearly, newYearlyVal, inflationRate, raisePercentage) {
    // Salary chart
    if (salaryChart) salaryChart.destroy();
    const salaryCtx = document.getElementById("salary-chart").getContext("2d");
    salaryChart = new Chart(salaryCtx, {
      type: "bar",
      data: {
        labels: ["Current Salary", "Target Salary"],
        datasets: [{
          label: "Yearly Salary ($)",
          data: [prevYearly, newYearlyVal],
          backgroundColor: darkMode ? ["#4a5568", "#6366f1"] : ["#667eea", "#90cdf4"],
          borderRadius: 6
        }]
      },
      options: getChartOptions("Salary Comparison")
    });

    // Projection chart
    const projections = Array.from({ length: 10 }, (_, i) => i + 1)
      .reduce((acc, year) => {
        acc.nominal.push(acc.nominal[acc.nominal.length - 1] * (1 + raisePercentage / 100));
        acc.real.push(acc.nominal[year] / Math.pow(1 + inflationRate / 100, year));
        return acc;
      }, { nominal: [newYearlyVal], real: [] });

    if (projectionChart) projectionChart.destroy();
    const projectionCtx = document.getElementById("projection-chart").getContext("2d");
    projectionChart = new Chart(projectionCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: 10 }, (_, i) => i + 1),
        datasets: [
          {
            label: "Nominal Salary",
            data: projections.nominal.slice(1),
            borderColor: darkMode ? "#6366f1" : "#667eea",
            tension: 0.4
          },
          {
            label: "Inflation Adjusted",
            data: projections.real,
            borderColor: darkMode ? "#e53e3e" : "#f56565",
            tension: 0.4
          }
        ]
      },
      options: getChartOptions("10-Year Projection", "Years")
    });
  }

  function getChartOptions(titleText, xTitle = "") {
    const tickFontSize = window.innerWidth < 600 ? 12 : 14;
    return {
      responsive: true,
      plugins: {
        legend: { labels: { font: { size: tickFontSize } } },
        title: { display: true, text: titleText }
      },
      scales: {
        x: {
          title: { display: !!xTitle, text: xTitle, font: { size: tickFontSize } },
          ticks: { color: darkMode ? "#d0d5dd" : "#2d3748" }
        },
        y: {
          title: { display: true, text: "Yearly Salary ($)", font: { size: tickFontSize } },
          ticks: { color: darkMode ? "#d0d5dd" : "#2d3748" },
          beginAtZero: true
        }
      }
    };
  }

  // Email functionality
  document.getElementById("email-report-btn").addEventListener("click", () => {
    const email = document.getElementById("user-email").value;
    if (!email) return alert("Please enter your email address");

    emailjs.send("service_ID", "template_ID", {
      to_email: email,
      absolute_increase: absoluteIncrease.textContent,
      percentage_growth: percentageGrowth.textContent,
      prev_yearly: prevYearlySalary.textContent,
      new_yearly: newYearlySalary.textContent,
      inflation_adjusted: newYearlySalaryInflation.textContent,
      career_advice: careerAdviceEl.textContent,
      current_date: new Date().toLocaleDateString()
    }).then(() => {
      alert("Report sent successfully!");
    }).catch((error) => {
      console.error("Email error:", error);
      alert("Failed to send email. Please try again.");
    });
  });

  // Helper functions
  function showError() {
    document.querySelector(".error-message").classList.remove("hidden");
    document.querySelectorAll(".results > *:not(.error-message)").forEach(el => el.classList.add("result-hidden"));
  }

  function hideError() {
    document.querySelector(".error-message").classList.add("hidden");
    document.querySelectorAll(".result-hidden").forEach(el => el.classList.remove("result-hidden"));
  }

  function updateChartTheme() {
    salaryChart.data.datasets[0].backgroundColor = darkMode ? ["#4a5568", "#6366f1"] : ["#667eea", "#90cdf4"];
    salaryChart.update();
  }

  function updateProjectionTheme() {
    projectionChart.data.datasets[0].borderColor = darkMode ? "#6366f1" : "#667eea";
    projectionChart.data.datasets[1].borderColor = darkMode ? "#e53e3e" : "#f56565";
    projectionChart.update();
  }
});