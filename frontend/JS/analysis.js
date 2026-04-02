let records = [];

window.onload = async () => {

    const business = localStorage.getItem("selectedBusiness");

    const res = await fetch(`http://localhost:5000/api/records?business=${business}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const data = await res.json();
    records = data.records || [];
};

async function sendMessage(){

    const input = document.getElementById("userInput");
    const msg = input.value;

    if(!msg) return;

    addMessage(msg, "user");
    input.value = "";

    try {
        const res = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify({ message: msg })
        });

        const data = await res.json();

        addMessage(data.reply || "No response", "bot");

    } catch (err) {
        console.error(err);
        addMessage("Error connecting to AI", "bot");
    }
}

function addMessage(text, sender){
    const box = document.getElementById("chatBox");
    const div = document.createElement("div");

    div.className = sender === "user" ? "user-msg" : "bot-msg";
    div.innerText = text;

    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

