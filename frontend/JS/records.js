let records = [];

let monthChart;
let yearChart;

window.onload = async () => {

    await fetchRecords();

    loadYears();

    setDefaultFilters();

    applyFilter();

    document.getElementById("yearFilter").onchange = applyFilter;
    document.getElementById("monthFilter").onchange = applyFilter;
};

/* FETCH RECORDS */

async function fetchRecords() {

    const business = localStorage.getItem("selectedBusiness");

    const res = await fetch(`http://localhost:5000/api/records?business=${business}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const data = await res.json();

    records = data.records || [];
}

/* LOAD YEARS */

function loadYears() {

    const yearSet = new Set();

    records.forEach(r => {

        const year = new Date(r.date).getFullYear();

        yearSet.add(year);

    });

    const yearFilter = document.getElementById("yearFilter");

    yearFilter.innerHTML = "";

    [...yearSet]
        .sort((a, b) => b - a)
        .forEach(year => {

            const option = document.createElement("option");

            option.value = year;

            option.textContent = year;

            yearFilter.appendChild(option);

        });
}

/* DEFAULT FILTERS */

function setDefaultFilters() {

    const currentDate = new Date();

    document.getElementById("yearFilter").value =
        currentDate.getFullYear();

    document.getElementById("monthFilter").value =
        currentDate.getMonth();
}

/* FORMAT DATE */

function formatDate(dateString) {

    const date = new Date(dateString);

    const day =
        String(date.getDate()).padStart(2, "0");

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}/${month}/${year}`;
}

/* FILTER */

function applyFilter() {

    const year =
        document.getElementById("yearFilter").value;

    const month =
        document.getElementById("monthFilter").value;

    let filtered = [...records];

    filtered = filtered.filter(r => {

        const recordDate = new Date(r.date);

        return (
            recordDate.getFullYear() == year &&
            recordDate.getMonth() == month
        );

    });

    displayData(filtered);

    loadTopIncome(filtered);

    loadTopExpense(filtered);

    createMonthChart(filtered);

    createYearChart(year);
}

/* DISPLAY MAIN TABLE */

function displayData(data) {

    const table =
        document.getElementById("recordsTable");

    table.innerHTML = "";

    const grouped = {};

    data.forEach(r => {

        const date =
            r.date.split("T")[0];

        if (!grouped[date]) {

            grouped[date] = {
                income: 0,
                expense: 0
            };

        }

        if (r.type === "income") {

            grouped[date].income += r.amount;

        } else {

            grouped[date].expense += r.amount;

        }

    });

    const sortedDates =
        Object.keys(grouped)
        .sort((a, b) =>
            new Date(b) - new Date(a)
        )
        .slice(0, 15);

    sortedDates.forEach(date => {

        const income =
            grouped[date].income;

        const expense =
            grouped[date].expense;

        const profitLoss =
            income - expense;

        const row = `

            <tr>

                <td>
                    ${formatDate(date)}
                </td>

                <td>
                    ₹${income}
                </td>

                <td>
                    ₹${expense}
                </td>

                <td class="${profitLoss >= 0 ? 'profit' : ''}">

                    ${profitLoss >= 0
                        ? '₹' + profitLoss
                        : '-'}

                </td>

                <td class="${profitLoss < 0 ? 'loss' : ''}">

                    ${profitLoss < 0
                        ? '(₹' + Math.abs(profitLoss) + ')'
                        : '-'}

                </td>

            </tr>

        `;

        table.innerHTML += row;

    });

}

/* TOP 3 INCOME */

function loadTopIncome(data) {

    const incomeTable =
        document.getElementById("topIncomeTable");

    incomeTable.innerHTML = "";

    const incomes =
        data
        .filter(r => r.type === "income")
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

    incomes.forEach(r => {

        incomeTable.innerHTML += `

            <tr>

                <td>
                    ${formatDate(r.date)}
                </td>

                <td class="profit">
                    ₹${r.amount}
                </td>

            </tr>

        `;

    });

}

/* TOP 3 EXPENSE */

function loadTopExpense(data) {

    const expenseTable =
        document.getElementById("topExpenseTable");

    expenseTable.innerHTML = "";

    const expenses =
        data
        .filter(r => r.type === "expense")
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 3);

    expenses.forEach(r => {

        expenseTable.innerHTML += `

            <tr>

                <td>
                    ${formatDate(r.date)}
                </td>

                <td class="loss">
                    ₹${r.amount}
                </td>

            </tr>

        `;

    });

}

/* MONTH PIE CHART */

function createMonthChart(data) {

    let totalProfit = 0;
    let totalLoss = 0;

    data.forEach(r => {

        if (r.type === "income") {

            totalProfit += r.amount;

        } else {

            totalLoss += r.amount;

        }

    });

    const ctx = document.getElementById("monthChart");

    if (monthChart) {

        monthChart.destroy();

    }

    monthChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: ["Income", "Expense"],

            datasets: [{

                data: [
                    totalProfit,
                    totalLoss
                ],

                backgroundColor: [
                    "#22c55e",
                    "#ef4444"
                ]

            }]

        },

        options: {

            responsive: true,

            animation: {
                animateRotate: true,
                duration: 1200
            },

            plugins: {

                legend: {
                    position: "bottom"
                },

                datalabels: {

                    color: "#fff",

                    font: {
                        weight: "bold",
                        size: 14
                    },

                    formatter: (value, context) => {

                        const data =
                            context.chart.data.datasets[0].data;

                        const total =
                            data.reduce((a, b) => a + b, 0);

                        const percentage =
                            ((value / total) * 100).toFixed(1);

                        return percentage + "%";

                    }

                }

            }

        },

        plugins: [ChartDataLabels]

    });

}

/* YEAR PIE CHART */

function createYearChart(selectedYear) {

    let yearProfit = 0;
    let yearLoss = 0;

    const yearlyData =
        records.filter(r =>
            new Date(r.date).getFullYear()
            == selectedYear
        );

    yearlyData.forEach(r => {

        if (r.type === "income") {

            yearProfit += r.amount;

        } else {

            yearLoss += r.amount;

        }

    });

    const ctx =
        document.getElementById("yearChart");

    if (yearChart) {

        yearChart.destroy();

    }

    yearChart = new Chart(ctx, {

        type: "pie",

        data: {

            labels: ["Income", "Expense"],

            datasets: [{

                data: [
                    yearProfit,
                    yearLoss
                ],

                backgroundColor: [
                    "#3b82f6",
                    "#f97316"
                ]

            }]

        },

        options: {

            responsive: true,

            animation: {
                animateRotate: true,
                duration: 1200
            },

            plugins: {

                legend: {
                    position: "bottom"
                },

                datalabels: {

                    color: "#fff",

                    font: {
                        weight: "bold",
                        size: 14
                    },

                    formatter: (value, context) => {

                        const data =
                            context.chart.data.datasets[0].data;

                        const total =
                            data.reduce((a, b) => a + b, 0);

                        const percentage =
                            ((value / total) * 100).toFixed(1);

                        return percentage + "%";

                    }

                }

            }

        },

        plugins: [ChartDataLabels]

    });

}
