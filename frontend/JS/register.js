async function signup(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch("http://localhost:5000/api/auth/register",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({ email, password })

});

const data = await res.json();

if(data.success){

alert("Account Created Successfully");

window.location.href="login.html";

}else{

alert(data.message);

}

}

document.querySelector(".signup-btn").addEventListener("click",signup);
