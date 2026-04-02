let records = [];
let incomeChart, profitChart;

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

window.onload = async () => {
    await fetchData();
    setupFilters();
    updateDashboard();
};

async function fetchData(){

    const business = localStorage.getItem("selectedBusiness");

    const res = await fetch(`http://localhost:5000/api/records?business=${business}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const data = await res.json();
    records = data.records || [];
}

function setupFilters(){
    const yearSet = new Set();

    records.forEach(r => {
        const d = new Date(r.date);
        yearSet.add(d.getFullYear());
    });

    const yearFilter = document.getElementById("yearFilter");
    const monthFilter = document.getElementById("monthFilter");

    // 🔥 CURRENT DATE
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // ✅ LOAD YEARS
    yearFilter.innerHTML = `<option value="">All Years</option>`;

    yearSet.forEach(y => {
        yearFilter.innerHTML += `<option value="${y}">${y}</option>`;
    });

    // ✅ LOAD MONTHS
    monthFilter.innerHTML = `<option value="">All Months</option>`;

    months.forEach((m,i)=>{
        monthFilter.innerHTML += `<option value="${i}">${m}</option>`;
    });

    // 🔥 SET DEFAULT VALUES
    yearFilter.value = currentYear;
    monthFilter.value = currentMonth;

    // 🔥 EVENTS
    yearFilter.onchange = updateDashboard;
    monthFilter.onchange = updateDashboard;
}

function updateDashboard(){

    const year = document.getElementById("yearFilter").value;
    const month = document.getElementById("monthFilter").value;

    let monthlyIncome = Array(12).fill(0);
    let monthlyExpense = Array(12).fill(0);

    records.forEach(r=>{
        const d = new Date(r.date);
        const y = d.getFullYear();
        const m = d.getMonth();

        if(year && y != year) return;

        if(r.type === "income") monthlyIncome[m] += r.amount;
        else monthlyExpense[m] += r.amount;
    });

    if(month !== ""){
        const m = parseInt(month);
        const inc = monthlyIncome[m];
        const exp = monthlyExpense[m];
        const prof = inc - exp;

        document.getElementById("income").innerText = "₹" + inc;
        document.getElementById("expense").innerText = "₹" + exp;
        document.getElementById("profit").innerText = "₹" + prof;
    }

    renderCharts(monthlyIncome, monthlyExpense, month);
}

function renderCharts(income, expense, selectedMonth){

    const profit = income.map((v,i)=> v - expense[i]);

    if(incomeChart) incomeChart.destroy();
    if(profitChart) profitChart.destroy();

    incomeChart = new Chart(document.getElementById("incomeExpenseChart"), {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                { label: "Income", data: income, borderColor: "blue" },
                { label: "Expense", data: expense, borderColor: "red" }
            ]
        }
    });

    profitChart = new Chart(document.getElementById("profitChart"), {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: "Profit",
                data: profit,
                backgroundColor: profit.map((v,i)=>
                    i == selectedMonth ? "orange" : "green"
                )
            }]
        }
    });
}