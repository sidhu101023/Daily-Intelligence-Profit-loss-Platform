let records = [];

window.onload = async () => {
    await fetchRecords();
    loadYears();
    displayData(records);

    document.getElementById("yearFilter").onchange = applyFilter;
    document.getElementById("monthFilter").onchange = applyFilter;
};

async function fetchRecords(){

    const business = localStorage.getItem("selectedBusiness");

    const res = await fetch(`http://localhost:5000/api/records?business=${business}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const data = await res.json();
    records = data.records || [];
}

// LOAD YEARS
function loadYears() {
    const yearSet = new Set();

    records.forEach(r => {
        const year = new Date(r.date).getFullYear();
        yearSet.add(year);
    });

    const yearFilter = document.getElementById("yearFilter");

    // ✅ ADD ALL OPTION
    yearFilter.innerHTML = `<option value="">All Years</option>`;

    yearSet.forEach(year => {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// DISPLAY TABLE
function displayData(data) {
    const table = document.getElementById("recordsTable");
    table.innerHTML = "";

    // 🔥 GROUP BY DATE
    const grouped = {};

    data.forEach(r => {
        const date = r.date.split("T")[0];

        if (!grouped[date]) {
            grouped[date] = { income: 0, expense: 0 };
        }

        if (r.type === "income") {
            grouped[date].income += r.amount;
        } else {
            grouped[date].expense += r.amount;
        }
    });

    // 🔥 DISPLAY MERGED DATA
    // 🔥 SORT DATES (LATEST FIRST)
const sortedDates = Object.keys(grouped).sort((a, b) => {
    return new Date(b) - new Date(a);
});

// 🔥 LOOP THROUGH SORTED DATES
sortedDates.forEach(date => {
    const income = grouped[date].income;
    const expense = grouped[date].expense;
    const profitLoss = income - expense;

    const row = `
        <tr>
            <td>${date}</td>
            <td>₹${income}</td>
            <td>₹${expense}</td>
            <td class="${profitLoss >= 0 ? 'profit' : ''}">
                ${profitLoss >= 0 ? '₹' + profitLoss : '-'}
            </td>
            <td class="${profitLoss < 0 ? 'loss' : ''}">
                ${profitLoss < 0 ? '(₹' + Math.abs(profitLoss) + ')' : '-'}
            </td>
        </tr>
    `;

    table.innerHTML += row;
});
}

// FILTER
function applyFilter() {

    const year = document.getElementById("yearFilter").value;
    const month = document.getElementById("monthFilter").value;

    let filtered = records;

    if (year) {
        filtered = filtered.filter(r =>
            new Date(r.date).getFullYear() == year
        );
    }

    if (month !== "") {
        filtered = filtered.filter(r =>
            new Date(r.date).getMonth() == month
        );
    }

    displayData(filtered);
}