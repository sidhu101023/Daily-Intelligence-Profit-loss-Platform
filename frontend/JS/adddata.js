function toggleForm() {
    const type = document.getElementById("typeSelect").value;

    document.getElementById("incomeCard").classList.add("hidden");
    document.getElementById("expenseCard").classList.add("hidden");

    if (type === "income") {
        document.getElementById("incomeCard").classList.remove("hidden");
    } else if (type === "expense") {
        document.getElementById("expenseCard").classList.remove("hidden");
    }
}

// ADD INCOME
async function addIncome(){

    const business = localStorage.getItem("selectedBusiness");
    const token = localStorage.getItem("token");

    const amountEl = document.getElementById("incomeAmount");
    const descEl = document.getElementById("incomeDesc");
    const dateEl = document.getElementById("dateInput");

    if(!amountEl || !descEl || !dateEl){
        alert("Input fields not found");
        return;
    }

    const amount = amountEl.value;

    if(!amount){
        alert("Enter amount");
        return;
    }

    const data = {
        type: "income",
        amount: Number(amount),
        description: descEl.value,
        date: dateEl.value,
        business
    };

    const res = await fetch("http://localhost:5000/api/records", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if(result.success === true){
        alert("Income Added");
    } else {
        console.log("Backend response:", result);
        alert(result.message || "Error saving data");
    }
}

async function addExpense(){

    const business = localStorage.getItem("selectedBusiness");

    const data = {
        type: "expense",
        amount: Number(document.getElementById("expenseAmount").value),
        description: document.getElementById("expenseDesc").value,
        date: document.getElementById("dateInput").value,
        business
    };

    const res = await fetch("http://localhost:5000/api/records", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("token")
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if(result.success){
        alert("Expense Added");
    }
}