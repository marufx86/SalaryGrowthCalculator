document.addEventListener("DOMContentLoaded", () => {
  const calculateBtn = document.getElementById("calculate-btn")
  const resultDiv = document.getElementById("result")
  const amountIncrease = document.getElementById("amount-increase")
  const percentageIncrease = document.getElementById("percentage-increase")

  calculateBtn.addEventListener("click", () => {
    const previousSalary = Number.parseFloat(document.getElementById("previous-salary").value)
    const newSalary = Number.parseFloat(document.getElementById("new-salary").value)

    if (isNaN(previousSalary) || isNaN(newSalary)) {
      alert("Please enter valid numbers for both salaries.")
      return
    }

    const increase = newSalary - previousSalary
    const percentIncrease = (increase / previousSalary) * 100

    amountIncrease.textContent = `$${increase.toFixed(2)}`
    percentageIncrease.textContent = `${percentIncrease.toFixed(2)}%`

    resultDiv.classList.remove("hidden")
  })
})

