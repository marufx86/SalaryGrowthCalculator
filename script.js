/* Initialize EmailJS – replace "PublicAPI" with your actual public key if needed */
;(() => {
  emailjs.init("PublicAPI");
})();

document.addEventListener("DOMContentLoaded", () => {
  // Buttons and DOM Elements
  const calculateBtn = document.getElementById("calculate-btn");
  const themeToggle = document.getElementById("theme-toggle");
  const resultsDiv = document.getElementById("results");
  const absoluteIncreaseEl = document.getElementById("absolute-increase");
  const percentageGrowthEl = document.getElementById("percentage-growth");
  const prevYearlySalaryEl = document.getElementById("prev-yearly-salary");
  const newYearlySalaryEl = document.getElementById("new-yearly-salary");
  const newYearlySalaryInflationEl = document.getElementById("new-yearly-salary-inflation");
  const careerAdviceEl = document.getElementById("career-advice");
  const userEmailEl = document.getElementById("user-email");
  const emailReportBtn = document.getElementById("email-report-btn");

  // Converted value elements
  const convertedPrevYearlyEl = document.getElementById("converted-prev-yearly");
  const convertedNewYearlyEl = document.getElementById("converted-new-yearly");
  const convertedInflationAdjustedEl = document.getElementById("converted-inflation-adjusted");

  // Currency dropdowns for input and conversion
  const inputCurrencySelect = document.getElementById("input-currency");
  const conversionCurrencySelect = document.getElementById("conversion-currency");

  // For displaying currency codes in results
  const inputCurrencyDisplayEls = [
    document.getElementById("input-currency-display"),
    document.getElementById("input-currency-display2"),
    document.getElementById("input-currency-display3"),
    document.getElementById("input-currency-display4")
  ];
  const conversionCurrencyDisplayEls = [
    document.getElementById("conversion-currency-display"),
    document.getElementById("conversion-currency-display2"),
    document.getElementById("conversion-currency-display3")
  ];

  let salaryChart, projectionChart;
  let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false;
  let exchangeRates = {};

  // Apply saved theme
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

  // Fetch exchange rates (base: USD)
  async function fetchExchangeRates() {
    try {
      const response = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await response.json();
      exchangeRates = data.rates;
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  }
  fetchExchangeRates();

  calculateBtn.addEventListener("click", () => {
    // Parse input values
    const baseSalaryInput = parseFloat(document.getElementById("base-salary").value);
    const targetSalaryInput = parseFloat(document.getElementById("target-salary").value);
    const inflationRate = parseFloat(document.getElementById("inflation-rate").value) || 0;
    const inputCurrency = inputCurrencySelect.value;
    const conversionCurrency = conversionCurrencySelect.value;

    if (isNaN(baseSalaryInput) || isNaN(targetSalaryInput)) {
      alert("Please enter valid salary amounts.");
      return;
    }

    // Calculate absolute increase as the monthly difference
    const absoluteDiff = targetSalaryInput - baseSalaryInput; // e.g. 15,000 - 12,000 = 3,000
    // Percentage growth based on monthly values
    const raisePercentage = (absoluteDiff / baseSalaryInput) * 100;
    // Yearly calculations remain unchanged
    const prevYearly = baseSalaryInput * 12;
    const newYearly = targetSalaryInput * 12;
    const newYearlyInflation = newYearly / (1 + inflationRate / 100);

    // Update results (in input currency) – using whole numbers for most values.
    absoluteIncreaseEl.textContent = `${absoluteDiff.toFixed(0)}`;
    percentageGrowthEl.textContent = `${raisePercentage.toFixed(1)}%`;
    prevYearlySalaryEl.textContent = `${prevYearly.toFixed(0)}`;
    newYearlySalaryEl.textContent = `${newYearly.toFixed(0)}`;
    // Inflation adjusted salary shows a dollar sign as per sample
    newYearlySalaryInflationEl.textContent = `${newYearlyInflation.toFixed(0)}`;

    // Display the input currency code with the amounts
    inputCurrencyDisplayEls.forEach(el => el.textContent = ` ${inputCurrency}`);

    // If exchange rates for both currencies are available, compute conversion factor
    if (exchangeRates[inputCurrency] && exchangeRates[conversionCurrency]) {
      const conversionFactor = exchangeRates[conversionCurrency] / exchangeRates[inputCurrency];
      const convertedPrevYearly = prevYearly * conversionFactor;
      const convertedNewYearly = newYearly * conversionFactor;
      const convertedInflationAdjusted = newYearlyInflation * conversionFactor;
      convertedPrevYearlyEl.textContent = `${convertedPrevYearly.toFixed(0)}`;
      convertedNewYearlyEl.textContent = `${convertedNewYearly.toFixed(0)}`;
      convertedInflationAdjustedEl.textContent = `${convertedInflationAdjusted.toFixed(0)}`;
      // Display the conversion currency code with the converted values
      conversionCurrencyDisplayEls.forEach(el => el.textContent = ` ${conversionCurrency}`);
    } else {
      convertedPrevYearlyEl.textContent = "N/A";
      convertedNewYearlyEl.textContent = "N/A";
      convertedInflationAdjustedEl.textContent = "N/A";
    }

    // Career advice based on real increase percentage
    const realIncreasePercentage = ((newYearlyInflation / prevYearly) - 1) * 100;
    if (realIncreasePercentage < 5) {
      careerAdviceEl.textContent = `Your nominal raise is ${raisePercentage.toFixed(1)}%, but after inflation the real increase is ${realIncreasePercentage.toFixed(1)}%. Consider negotiating higher.`;
    } else {
      careerAdviceEl.textContent = `Great work! Your nominal raise is ${raisePercentage.toFixed(1)}% and your real increase is ${realIncreasePercentage.toFixed(1)}%. Keep growing!`;
    }

    // Show results section
    resultsDiv.classList.remove("hidden");
    resultsDiv.classList.add("show");

    // Update charts
    updateCharts(prevYearly, newYearly, inflationRate, raisePercentage);
  });

  function updateCharts(prevYearly, newYearly, inflationRate, raisePercentage) {
    // Salary Comparison Chart
    if (salaryChart) salaryChart.destroy();
    const salaryCtx = document.getElementById("salary-chart").getContext("2d");
    salaryChart = new Chart(salaryCtx, {
      type: "bar",
      data: {
        labels: ["Current Yearly Salary", "New Yearly Salary"],
        datasets: [{
          label: "Salary",
          data: [prevYearly, newYearly],
          backgroundColor: darkMode ? ["#4a5568", "#6366f1"] : ["#667eea", "#90cdf4"],
          borderRadius: 6
        }]
      },
      options: getChartOptions("Salary Comparison")
    });

    // 10-Year Projection Chart
    let projections = {
      nominal: [newYearly],
      real: []
    };
    for (let year = 1; year <= 10; year++) {
      let nominalSalary = projections.nominal[projections.nominal.length - 1] * (1 + raisePercentage / 100);
      projections.nominal.push(nominalSalary);
      projections.real.push(nominalSalary / Math.pow(1 + inflationRate / 100, year));
    }
    // Remove the initial value from nominal projection
    const nominalProjection = projections.nominal.slice(1);

    if (projectionChart) projectionChart.destroy();
    const projectionCtx = document.getElementById("projection-chart").getContext("2d");
    projectionChart = new Chart(projectionCtx, {
      type: "line",
      data: {
        labels: Array.from({ length: 10 }, (_, i) => i + 1),
        datasets: [
          {
            label: "Nominal Salary",
            data: nominalProjection,
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
          title: { display: true, text: "Salary", font: { size: tickFontSize } },
          ticks: { color: darkMode ? "#d0d5dd" : "#2d3748" },
          beginAtZero: true
        }
      }
    };
  }

  // Email Report Functionality
  emailReportBtn.addEventListener("click", () => {
    const email = userEmailEl.value;
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    emailjs.send("service_ID", "template_ID", {
      to_email: email,
      absolute_increase: absoluteIncreaseEl.textContent + " " + inputCurrencySelect.value,
      percentage_growth: percentageGrowthEl.textContent,
      prev_yearly: prevYearlySalaryEl.textContent + " " + inputCurrencySelect.value,
      new_yearly: newYearlySalaryEl.textContent + " " + inputCurrencySelect.value,
      inflation_adjusted: newYearlySalaryInflationEl.textContent + " " + inputCurrencySelect.value,
      converted_prev_yearly: convertedPrevYearlyEl.textContent + " " + conversionCurrencySelect.value,
      converted_new_yearly: convertedNewYearlyEl.textContent + " " + conversionCurrencySelect.value,
      converted_inflation_adjusted: convertedInflationAdjustedEl.textContent + " " + conversionCurrencySelect.value,
      career_advice: careerAdviceEl.textContent,
      current_date: new Date().toLocaleDateString()
    }).then(() => {
      alert("Report sent successfully!");
    }).catch((error) => {
      console.error("Email error:", error);
      alert("Failed to send email. Please try again.");
    });
  });

  function updateChartTheme() {
    if (salaryChart) {
      salaryChart.data.datasets[0].backgroundColor = darkMode ? ["#4a5568", "#6366f1"] : ["#667eea", "#90cdf4"];
      salaryChart.update();
    }
  }

  function updateProjectionTheme() {
    if (projectionChart) {
      projectionChart.data.datasets[0].borderColor = darkMode ? "#6366f1" : "#667eea";
      projectionChart.data.datasets[1].borderColor = darkMode ? "#e53e3e" : "#f56565";
      projectionChart.update();
    }
  }
});
