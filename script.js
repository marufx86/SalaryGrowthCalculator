// Import EmailJS (assuming you are using a CDN or a module bundler)
// For CDN, include the script tag in your HTML file: <script src="https://cdn.emailjs.com/sdk/2.6.0/email.min.js"></script>
// For module bundlers like Webpack or Parcel, use the appropriate import statement.

// Initialize EmailJS
;(() => {
  emailjs.init("Public") // Replace with your actual Public Key
})()

document.addEventListener("DOMContentLoaded", () => {
  const calculateBtn = document.getElementById("calculate-btn")
  const themeToggle = document.getElementById("theme-toggle")
  const resultsDiv = document.getElementById("results")
  const absoluteIncrease = document.getElementById("absolute-increase")
  const percentageGrowth = document.getElementById("percentage-growth")
  const prevYearlySalary = document.getElementById("prev-yearly-salary")
  const newYearlySalary = document.getElementById("new-yearly-salary")
  const newYearlySalaryInflation = document.getElementById("new-yearly-salary-inflation")
  const careerAdviceEl = document.getElementById("career-advice")
  let salaryChart
  let projectionChart
  let darkMode = JSON.parse(localStorage.getItem("darkMode")) || false

  // Apply saved theme
  document.body.classList.toggle("dark-mode", darkMode)
  themeToggle.classList.toggle("active", darkMode)

  // Theme toggle functionality
  themeToggle.addEventListener("click", () => {
    darkMode = !darkMode
    document.body.classList.toggle("dark-mode", darkMode)
    themeToggle.classList.toggle("active", darkMode)
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    if (salaryChart) updateChartTheme()
    if (projectionChart) updateProjectionTheme()
  })

  calculateBtn.addEventListener("click", () => {
    const baseSalary = Number.parseFloat(document.getElementById("base-salary").value)
    const targetSalary = Number.parseFloat(document.getElementById("target-salary").value)
    let inflationRate = Number.parseFloat(document.getElementById("inflation-rate").value)
    if (isNaN(inflationRate)) inflationRate = 0

    if (isNaN(baseSalary) || isNaN(targetSalary)) {
      showError()
      return
    }

    // Determine tick font size based on screen width for better readability
    const tickFontSize = window.innerWidth < 600 ? 12 : 14

    // Analysis calculations
    const absoluteDiff = targetSalary - baseSalary
    const raisePercentage = (absoluteDiff / baseSalary) * 100
    const prevYearly = baseSalary * 12
    const newYearlyVal = targetSalary * 12
    // Calculate inflation-adjusted yearly salary for one year
    const newYearlyInflationVal = newYearlyVal / (1 + inflationRate / 100)

    absoluteIncrease.textContent = `$${absoluteDiff.toFixed(2)}`
    percentageGrowth.textContent = `${raisePercentage.toFixed(1)}%`
    prevYearlySalary.textContent = `$${prevYearly.toFixed(2)}`
    newYearlySalary.textContent = `$${newYearlyVal.toFixed(2)}`
    newYearlySalaryInflation.textContent = `$${newYearlyInflationVal.toFixed(2)}`

    // --- Career Growth Advice (Alternative) ---
    // Calculate the real (inflation-adjusted) growth percentage between your previous and new salaries.
    // This shows how much your purchasing power has actually increased.
    const realIncreasePercentage = (newYearlyInflationVal / prevYearly - 1) * 100
    // Provide advice based on the real increase:
    if (realIncreasePercentage < 5) {
      careerAdviceEl.textContent = `Your nominal raise is ${raisePercentage.toFixed(1)}%, but after accounting for inflation, your real increase is only ${realIncreasePercentage.toFixed(1)}%. This suggests that inflation is eroding your gains. Consider negotiating a higher raise or investing in upskilling to secure better compensation.`
    } else {
      careerAdviceEl.textContent = `Great work! Your nominal raise of ${raisePercentage.toFixed(1)}% translates into an inflation-adjusted increase of ${realIncreasePercentage.toFixed(1)}%, ensuring a meaningful boost to your purchasing power. Continue investing in your professional growth.`
    }
    // --- End Career Growth Advice ---

    hideError()
    resultsDiv.classList.remove("hidden")
    resultsDiv.classList.add("show")

    // Create or update the salary chart (bar chart)
    if (salaryChart) {
      salaryChart.destroy()
    }
    const salaryCtx = document.getElementById("salary-chart").getContext("2d")
    const backgroundColors = darkMode ? ["#4a5568", "#6366f1"] : ["#667eea", "#90cdf4"]
    salaryChart = new Chart(salaryCtx, {
      type: "bar",
      data: {
        labels: ["Current Yearly Salary", "Target Yearly Salary"],
        datasets: [
          {
            label: "Yearly Salary ($)",
            data: [prevYearly, newYearlyVal],
            backgroundColor: backgroundColors,
            borderRadius: 6,
            maxBarThickness: 50,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: tickFontSize },
              color: darkMode ? "#d0d5dd" : "#2d3748",
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: { size: tickFontSize },
            },
          },
        },
      },
    })

    // Projection calculation for 10 years (compound growth and inflation adjustment)
    const projectedYearlySalaries = []
    const projectedRealSalaries = []
    let currentNominalSalary = newYearlyVal
    // Here we compound the new salary by the same raise percentage each year.
    for (let year = 1; year <= 10; year++) {
      currentNominalSalary *= 1 + raisePercentage / 100
      projectedYearlySalaries.push(currentNominalSalary)
      // Discount the nominal salary by the cumulative inflation factor for that year.
      const realSalary = currentNominalSalary / Math.pow(1 + inflationRate / 100, year)
      projectedRealSalaries.push(realSalary)
    }

    // Create or update the projection chart (line chart) with both datasets
    if (projectionChart) {
      projectionChart.destroy()
    }
    const projectionCtx = document.getElementById("projection-chart").getContext("2d")
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
            pointHoverRadius: 6,
          },
          {
            label: "Inflation Adjusted Salary ($)",
            data: projectedRealSalaries,
            borderColor: darkMode ? "#e53e3e" : "#f56565",
            backgroundColor: darkMode ? "#c53030" : "#feb2b2",
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Years",
              font: { size: tickFontSize },
            },
            ticks: {
              font: { size: tickFontSize },
              color: darkMode ? "#d0d5dd" : "#2d3748",
            },
          },
          y: {
            title: {
              display: true,
              text: "Yearly Salary ($)",
              font: { size: tickFontSize },
            },
            beginAtZero: false,
            ticks: {
              font: { size: tickFontSize },
              color: darkMode ? "#d0d5dd" : "#2d3748",
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              font: { size: tickFontSize },
            },
          },
        },
      },
    })
  })

  function showError() {
    const errorMessage = document.querySelector(".error-message")
    errorMessage.classList.remove("hidden")
    document.querySelectorAll(".results h2, .results p, .chart-container").forEach((el) => {
      el.classList.add("result-hidden")
    })
  }

  function hideError() {
    const errorMessage = document.querySelector(".error-message")
    errorMessage.classList.add("hidden")
    document.querySelectorAll(".results h2, .results p, .chart-container").forEach((el) => {
      el.classList.remove("result-hidden")
    })
  }

  function updateChartTheme() {
    if (!salaryChart) return
    const newBackgroundColors = darkMode ? ["#4a5568", "#6366f1"] : ["#667eea", "#90cdf4"]
    salaryChart.data.datasets[0].backgroundColor = newBackgroundColors
    salaryChart.options.scales.y.ticks.color = darkMode ? "#d0d5dd" : "#2d3748"
    salaryChart.update()
  }

  function updateProjectionTheme() {
    if (!projectionChart) return
    projectionChart.data.datasets[0].borderColor = darkMode ? "#6366f1" : "#667eea"
    projectionChart.data.datasets[0].backgroundColor = darkMode ? "#4a5568" : "#edf2f7"
    projectionChart.data.datasets[1].borderColor = darkMode ? "#e53e3e" : "#f56565"
    projectionChart.data.datasets[1].backgroundColor = darkMode ? "#c53030" : "#feb2b2"
    projectionChart.options.scales.x.title.text = "Years"
    projectionChart.options.scales.y.title.text = "Yearly Salary ($)"
    projectionChart.options.scales.y.ticks.color = darkMode ? "#d0d5dd" : "#2d3748"
    projectionChart.update()
  }

  const emailReportBtn = document.getElementById("email-report-btn")

  emailReportBtn.addEventListener("click", () => {
    const userEmail = document.getElementById("user-email").value
    if (!userEmail) {
      alert("Please enter your email address.")
      return
    }
    generateAndSendPDFReport(userEmail)
  })

  function generateAndSendPDFReport(userEmail) {
    const { jsPDF } = window.jspdf
    const doc = new jsPDF()

    // Add title
    doc.setFontSize(16)
    doc.text("Salary Growth Report", 105, 15, null, null, "center")

    // Add salary analysis
    doc.setFontSize(12)
    doc.text("Salary Analysis", 20, 25)
    doc.setFontSize(10)
    doc.text(`Absolute Increase: ${absoluteIncrease.textContent}`, 20, 35)
    doc.text(`Percentage Growth: ${percentageGrowth.textContent}`, 20, 40)
    doc.text(`Previous Yearly Salary: ${prevYearlySalary.textContent}`, 20, 45)
    doc.text(`After Increase Yearly Salary: ${newYearlySalary.textContent}`, 20, 50)
    doc.text(`After Increase Yearly Salary (inflation adjusted): ${newYearlySalaryInflation.textContent}`, 20, 55)

    // Add career advice
    doc.setFontSize(12)
    doc.text("Career Growth Advice", 20, 65)
    doc.setFontSize(10)
    const advice = careerAdviceEl.textContent
    const splitAdvice = doc.splitTextToSize(advice, 170)
    doc.text(splitAdvice, 20, 70)

    // Add charts
    doc.setFontSize(12)
    doc.text("Salary Comparison Chart", 105, 100, null, null, "center")
    const salaryChartImg = document.getElementById("salary-chart").toDataURL("image/png")
    doc.addImage(salaryChartImg, "PNG", 15, 105, 180, 70)

    doc.setFontSize(12)
    doc.text("Salary Projection Chart", 105, 185, null, null, "center")
    const projectionChartImg = document.getElementById("projection-chart").toDataURL("image/png")
    doc.addImage(projectionChartImg, "PNG", 15, 190, 180, 70)

    // Save PDF locally
    const pdfName = `SalaryGrowthReport_${Date.now()}.pdf`
    doc.save(pdfName)

    // Prepare email parameters
    const emailParams = {
      to_email: userEmail,
      from_name: "Salary Growth Calculator",
      message: `Your Salary Growth Report has been generated. In a real-world application, you would receive a link to download the PDF here. For now, please check your downloads folder for the file named ${pdfName}.`,
    }

    console.log("Sending email with params:", emailParams)

    // Send email using EmailJS
        // ServiceID, Template ID
    emailjs.send("service_ID", "template_ID", emailParams).then(
      (response) => {
        console.log("Email sent successfully", response)
        alert(
          `Salary Growth Report has been saved as ${pdfName} in your downloads folder. An email has been sent to ${userEmail} with further instructions.`,
        )
      },
      (error) => {
        console.error("Email send failed", error)
        console.error("Error details:", JSON.stringify(error))
        alert(
          `The report has been saved as ${pdfName} in your downloads folder, but we couldn't send an email to ${userEmail}. Please check your internet connection and try again later.`,
        )
      },
    )
  }
})

