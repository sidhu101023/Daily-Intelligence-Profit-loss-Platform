

async function login(){

const email = document.querySelector("input[type='email']").value;
const password = document.querySelector("input[type='password']").value;

const res = await fetch("http://localhost:5000/api/auth/login",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({ email, password })

});

const data = await res.json();

if(data.success){

localStorage.setItem("token", data.token);

window.location.href="dashboard.html";

}else{

alert(data.message);

}

}

document.querySelector(".login-btn").addEventListener("click",login);

