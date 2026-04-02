// 🔐 Redirect if not logged in
if(!localStorage.getItem("token")){
    window.location.href = "login.html";
}

const nameInput = document.getElementById("name");
const mobileInput = document.getElementById("mobile");
const businessCountInput = document.getElementById("businessCount");
const businessInputsDiv = document.getElementById("businessInputs");
const businessListDiv = document.getElementById("businessList");


// ---------------------
// LOAD PROFILE FROM BACKEND
// ---------------------

window.onload = async function(){

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
            "Authorization": token
        }
    });

    const data = await res.json();

    if(data.success){

        const user = data.user;

        if(user.name) nameInput.value = user.name;
        if(user.mobile) mobileInput.value = user.mobile.replace("+91","");

        loadBusinessList(user.businesses || []);
    }
};


// ---------------------
// CREATE BUSINESS INPUT
// ---------------------

function createBusinessInput(number){

    const input = document.createElement("input");

    input.type = "text";
    input.placeholder = "Business " + number + " Name";
    input.className = "businessName";

    businessInputsDiv.appendChild(input);
}


// ---------------------
// ADD NEW BUSINESS INPUTS
// ---------------------

businessCountInput.addEventListener("input", function(){

    const count = parseInt(this.value);

    businessInputsDiv.innerHTML = "";

    if(count > 0){
        for(let i = 1; i <= count; i++){
            createBusinessInput(i);
        }
    }

});


// ---------------------
// SAVE PROFILE
// ---------------------

document.getElementById("profileForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const name = nameInput.value;
    const mobile = mobileInput.value;

    if(mobile.length !== 10){
        alert("Mobile number must be 10 digits");
        return;
    }

    const token = localStorage.getItem("token");

    // ✅ 1. Get old businesses
    const oldRes = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
            "Authorization": token
        }
    });

    const oldData = await oldRes.json();

    let businesses = oldData.user.businesses || [];

    // ❌ removed duplicate variable + fixed logic

    // ✅ 2. Add new businesses
    const businessNames = document.querySelectorAll(".businessName");

    businessNames.forEach(b => {
        if (b.value.trim() && !businesses.includes(b.value.trim())) {
            businesses.push(b.value.trim());
        }
    });

    // ✅ 3. Save to backend
    const res = await fetch("http://localhost:5000/api/auth/profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify({
            name,
            mobile: "+91" + mobile,
            businesses
        })
    });

    const data = await res.json();

    if(data.success){
        loadBusinessList(businesses);
        businessInputsDiv.innerHTML = "";
        businessCountInput.value = "";
        alert("Profile Updated");
    }

});


// ---------------------
// LOAD BUSINESS LIST
// ---------------------

function loadBusinessList(businesses){

    businessListDiv.innerHTML = "";

    businesses.forEach((business, index) => {

        const row = document.createElement("div");
        row.className = "business-row";

        row.innerHTML = `
            <span>${business}</span>
            <button onclick="deleteBusiness(${index})" class="delete-btn">Delete</button>
        `;

        businessListDiv.appendChild(row);
    });
}


// ---------------------
// DELETE BUSINESS (FROM BACKEND)
// ---------------------

async function deleteBusiness(index){

    const token = localStorage.getItem("token");

    // get current businesses
    const res = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
            "Authorization": token
        }
    });

    const data = await res.json();

    let businesses = data.user.businesses || [];

    // remove selected
    businesses.splice(index, 1);

    // save updated list
    await fetch("http://localhost:5000/api/auth/profile", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        },
        body: JSON.stringify({
            name: data.user.name,
            mobile: data.user.mobile,
            businesses
        })
    });

    loadBusinessList(businesses);
}

document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("token"); // remove login token

    window.location.href = "login.html";

});