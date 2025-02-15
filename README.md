# Salary Growth Calculator & Currency Converter

This is a web-based tool designed to help you calculate and visualize your salary growth, taking into account inflation and currency conversion. It allows you to project your salary over the next 10 years and provides insights to help you negotiate for better compensation.

## Features

*   **Salary Calculation:**
    *   Calculates the absolute increase and percentage growth between your current and target monthly salaries.
    *   Calculates yearly salaries (both current and target) and adjusts the target salary for inflation.
*   **Currency Conversion:**
    *   Convert your salaries between different currencies using real-time exchange rates.
*   **Data Visualization:**
    *   Displays a bar chart comparing the current and target yearly salaries.
    *   Shows a line chart projecting your salary growth over the next 10 years, both nominally and inflation-adjusted.
*   **Career Advice:**
    *   Provides personalized career advice based on your salary growth and the impact of inflation.
*   **Dark Mode Toggle:**
    *   Switch between light and dark themes for comfortable viewing.
*   **Email Report Generation:**
    *   Generates a detailed email report of your salary analysis.

## Screenshots

![Salary Analysis Bar Chart](https://github.com/user-attachments/assets/86be426f-aeb3-4466-9668-e55954ea24a2)
![Salary Projection Line Chart](https://github.com/user-attachments/assets/9876e881-ecbe-4663-a7d9-7aea4a8ec98c)

## Technologies Used

*   HTML, CSS, and JavaScript
*   [Chart.js](https://www.chartjs.org/) for data visualization
*   [EmailJS](https://www.emailjs.com/) for email functionality
*   [ExchangeRate-API](https://www.exchangerate-api.com/) for real-time currency conversion

## How to Run

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/marufx86/SalaryGrowthCalculator.git
    ```

2.  **Open `index.html` in your web browser:**

    *   Simply navigate to the project directory and double-click the `index.html` file.

## Setup EmailJS

To enable the email report feature, you'll need to configure EmailJS:

1.  **Sign up for an EmailJS account:** Go to [https://www.emailjs.com/](https://www.emailjs.com/) and create a free account.
2.  **Connect your email service:** Follow the EmailJS documentation to connect your email service (e.g., Gmail, Outlook) to EmailJS.
3.  **Create an EmailJS template:** This is the design of your email report.  You'll use placeholders to insert the data from the calculator.  Here's an example template you can use:

    ```html
    Subject: Salary Report - {{current_date}}

    <h3>Salary Growth Report</h3>
    <p><strong>Absolute Increase:</strong> {{absolute_increase}}</p>
    <p><strong>Percentage Growth:</strong> {{percentage_growth}}</p>
    <p><strong>Previous Yearly Salary:</strong> {{prev_yearly}}</p>
    <p><strong>New Yearly Salary:</strong> {{new_yearly}}</p>
    <p><strong>Inflation Adjusted Salary:</strong> {{inflation_adjusted}}</p>
    <p><strong>Converted Previous Yearly Salary:</strong> {{converted_prev_yearly}}</p>
    <p><strong>Converted New Yearly Salary:</strong> {{converted_new_yearly}}</p>
    <p><strong>Converted Inflation Adjusted Salary:</strong> {{converted_inflation_adjusted}}</p>
    <h4>Career Growth Advice:</h4>
    <p>{{career_advice}}</p>
    ```

    *   **Important:**  Make sure the template variables (e.g., `{{absolute_increase}}`) match the names you're using in your `script.js` file when you call `emailjs.send()`. The current code uses, `absolute_increase: absoluteIncreaseEl.textContent + " " + inputCurrencySelect.value,` so keep that in mind when setting it up.
4.  **Get your EmailJS API keys:** You'll need your Service ID, Template ID, and Public Key.  These can be found in your EmailJS dashboard.
5.  To Email should be(dont use your own email)
    ```
    {{to_email}}
    ```
6.  **Update `script.js`:** Replace the placeholder values in the `emailjs.send()` function with your actual Service ID, Template ID, and Public Key.

    ```javascript
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual Public Key

    emailReportBtn.addEventListener("click", () => {
        const email = userEmailEl.value;
        if (!email) {
            alert("Please enter your email address.");
            return;
        }
        emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
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
    ```

## Contributing

Contributions are welcome! If you find a bug or have an idea for a new feature, please open an issue or submit a pull request.

## License

[MIT](LICENSE)
