// 🔐 check login
if(!localStorage.getItem("token")){
    window.location.href = "login.html";
}

async function loadBusinessTabs(){

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: { "Authorization": token }
    });

    const data = await res.json();

    if(data.success){

        const businesses = data.user.businesses || [];
        const container = document.getElementById("businessTabs");

        container.innerHTML = "";

        let selected = localStorage.getItem("selectedBusiness");

        // ✅ AUTO SELECT FIRST BUSINESS (NO ALERT)
        if(!selected && businesses.length > 0){
            selected = businesses[0];
            localStorage.setItem("selectedBusiness", selected);
        }

        businesses.forEach(b => {

            const tab = document.createElement("div");
            tab.className = "business-tab";
            tab.innerText = b;

            // highlight active
            if(b === selected){
                tab.classList.add("active");
            }

            tab.onclick = () => {
                localStorage.setItem("selectedBusiness", b);
                location.reload(); // refresh data
            };

            container.appendChild(tab);
        });
    }
}

window.addEventListener("load", loadBusinessTabs);