let records = [];
let comboChart, profitChart;

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

window.onload = async () => {

    const business = localStorage.getItem("selectedBusiness");

    const res = await fetch(`http://localhost:5000/api/records?business=${business}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const data = await res.json();
    records = data.records || [];

    document.getElementById("scenario").onchange = updatePrediction;
    document.getElementById("growth").oninput = updatePrediction;

    updatePrediction();
};

function updatePrediction(){

    const scenario = parseFloat(document.getElementById("scenario").value);
    const growthInput = document.getElementById("growth");
    const growth = parseFloat(growthInput.value) / 100;

    // ✅ SHOW GROWTH %
    document.getElementById("growthValue").innerText = growthInput.value + "%";

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.getDate();

    // =========================
    // 🔥 MONTHLY DATA (FOR GRAPHS)
    // =========================
    let income = Array(12).fill(0);
    let expense = Array(12).fill(0);

    records.forEach(r=>{
        const d = new Date(r.date);
        if(d.getFullYear() !== currentYear) return;

        const m = d.getMonth();

        if(r.type==="income") income[m]+=r.amount;
        else expense[m]+=r.amount;
    });

    let predictedIncome = [...income];
    let predictedExpense = [...expense];

    // =========================
    // 🔥 FUTURE MONTH PREDICTION (GRAPHS)
    // =========================
    for(let i = 0; i < 12; i++){

        if(i <= currentMonth) continue;

        let prevIncome, prevExpense;

        if(i === 0){
            const prevYearData = records.filter(r=>{
                const d = new Date(r.date);
                return d.getFullYear() === currentYear - 1 && d.getMonth() === 11;
            });

            prevIncome = 0;
            prevExpense = 0;

            prevYearData.forEach(r=>{
                if(r.type==="income") prevIncome += r.amount;
                else prevExpense += r.amount;
            });

        } else {
            prevIncome = predictedIncome[i-1];
            prevExpense = predictedExpense[i-1];
        }

        predictedIncome[i] = prevIncome * (1 + growth) * scenario;
        predictedExpense[i] = prevExpense * (1 + growth * 0.8) * scenario;
    }

    let profit = predictedIncome.map((v,i)=> v - predictedExpense[i]);

    // =========================
    // 🔥 CURRENT MONTH (DAY-BASED PREDICTION FOR CARDS)
    // =========================
    let currentIncome = 0;
    let currentExpense = 0;

    records.forEach(r=>{
        const d = new Date(r.date);

        if(
            d.getFullYear() === currentYear &&
            d.getMonth() === currentMonth
        ){
            if(r.type === "income") currentIncome += r.amount;
            else currentExpense += r.amount;
        }
    });

    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const remainingDays = totalDays - today;

    const avgIncome = currentIncome / (today || 1);
    const avgExpense = currentExpense / (today || 1);

    const finalPredictedIncome =
        currentIncome + (avgIncome * remainingDays * (1 + growth) * scenario);

    const finalPredictedExpense =
        currentExpense + (avgExpense * remainingDays * (1 + growth * 0.8) * scenario);

    const finalProfit = finalPredictedIncome - finalPredictedExpense;

    // =========================
    // 🔥 UPDATE CARDS (ONLY CURRENT MONTH)
    // =========================
    document.getElementById("pIncome").innerText =
        "₹" + finalPredictedIncome.toFixed(0);

    document.getElementById("pExpense").innerText =
        "₹" + finalPredictedExpense.toFixed(0);

    document.getElementById("pProfit").innerText =
        "₹" + finalProfit.toFixed(0);

    // =========================
    // 🔥 CHARTS (MONTHLY LOGIC)
    // =========================
    renderCharts(predictedIncome, predictedExpense, profit, currentMonth);
}

function renderCharts(income, expense, profit, currentMonth){

    if(comboChart) comboChart.destroy();
    if(profitChart) profitChart.destroy();

    comboChart = new Chart(document.getElementById("comboChart"), {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: "Income",
                    data: income,
                    borderColor: "blue",
                    borderDash: ctx => ctx.dataIndex > currentMonth ? [5,5] : []
                },
                {
                    label: "Expense",
                    data: expense,
                    borderColor: "red",
                    borderDash: ctx => ctx.dataIndex > currentMonth ? [5,5] : []
                }
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
                    i > currentMonth ? "orange" : "green"
                )
            }]
        }
    });
}