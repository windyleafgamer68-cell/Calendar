window.onload = function () {
}

const Month_var = document.getElementById('Month_Year')
// const Year_var = document.getElementById('Year')
// const Days_var = document.getElementsByClassName('Days')
const Numbers_var = document.getElementById('Numbers')
const prev_var = document.getElementById('prev')
const next_var = document.getElementById('next')


let current_date = new Date();

function update_calendar() {
    const current_year = current_date.getFullYear();
    const current_month = current_date.getMonth();
    
    const first_day = new Date(current_year, current_month, 0);
    const last_day = new Date(current_year, current_month + 1, 0);
    const total_days = last_day.getDate();
    const first_day_num = first_day.getDay();
    const last_day_num = last_day.getDay();

    const month_text = current_date.toLocaleString
    ('default', {month: 'long', year: 'numeric'});
    Month_var.textContent = month_text;
    

    let datesHTML = '';
    
    for(let i = first_day_num; i > 0; i--) {
        const prevDate = new Date(current_year,current_month, 0 - i + 1);
        datesHTML += `<div class = "date_inactive">${prevDate.getDate()}</div>`;
    }

    for(let i = 1; i <= total_days; i++) {
        const date = new Date(current_year, current_month, i);

        const key = makeKey(date);
        const stored = localStorage.getItem(key);
        const status = stored ? JSON.parse(stored).status : null;

        let dayClass = "";
        if (status === "completed") {
            dayClass = "green-day"
            
        }

        else if (status === "missed") {
            dayClass = "red-day";
        }

        else if (status == "partial") {
            dayClass = "partial-day";
            
        }

        else {
            const today_midnight = new Date(current_year, current_month, new Date().getDate());
            if (date < today_midnight) {
                dayClass = "active";
            }
        }

         let todayClass = "";
        if (date.toDateString() === new Date().toDateString()) {
            todayClass = "today";
        }

        if (status) todayClass = "";

        datesHTML += `<div class="Number ${todayClass} ${dayClass}">${i}</div>`;

        // const completed = localStorage.getItem(key) === "completed";
        // const completedClass = localStorage.getItem(key) === "completed" ? "green-day" : "";
        
        // if (completed) {
        //     activeClass = "";
        // }

        // datesHTML += `<div class="Number ${activeClass} ${dayClass}">${i}</div>`;


    }

    for (let i = 1; i<= 7 - last_day_num; i++) {
        const nextDate = new Date(current_year, current_month + 1, i)
        datesHTML += `<div class="date_inactive">${nextDate.getDate()}</div>`
    }

    Numbers_var.innerHTML = datesHTML
}

prev_var.addEventListener('click', () => {
    current_date.setMonth(current_date.getMonth() - 1);
    update_calendar();
})

next_var.addEventListener('click', () => {
    current_date.setMonth(current_date.getMonth() + 1);
    update_calendar();
})

document.getElementById("All_Ques").addEventListener("submit", function(event) {
    event.preventDefault();

    const q1 = document.querySelector('input[name="q1"]:checked');
    const q2 = document.querySelector('input[name="q2"]:checked');

    if (!q1 || !q2) {
        alert("Please answer both questions.");
        return;
    }

    const key = localStorage.getItem("selectedDay");
    if (!key) {
        alert("Select a day")
        return;
    }

    const [year, month, day] = key.split("-").map(Number);
    const selected = new Date(year, month, day);
    // if (!selectedIso) {
    //     alert("Please select a day on the calendar first");
    //     return;
    // } 

    //const selected = new Date(selectedIso);
    const today = new Date();
    const firstActiveKey = localStorage.getItem("firstActive")
    const firstActive = firstActiveKey 
        ?(() => {
            const [fy, fm, fd] = firstActiveKey.split("-").map(Number);
            return new Date(fy, fm, fd);
            })()
        : null ;

    const selectedDay = stripTime(selected);
    const todayDay = stripTime(today);
    const firstActiveDay = firstActive
        ? stripTime(firstActive) 
        : null;

    if (!firstActiveDay) {
        if (selectedDay.getTime() !== todayDay.getTime()) {
            alert("You can only edit today's date until you have your first active day.")
            return;
        }
    }


    if (selectedDay > todayDay) {
        alert("you cannot edit any future dates");
        return;
    }

    if ((firstActiveDay) && (selectedDay < firstActiveDay)) {
        alert("you cannot edit days before your first active day");
        return;
    }



    if (!firstActive) {
        localStorage.setItem("firstActive", key);
    }

    const timestamp = new Date().toISOString();

    if (q1.value === "No" && q2.value === "No") { 
        localStorage.setItem(key, JSON.stringify({
            status: "missed",
            time: timestamp})); 
    } 

    else if (q1.value === "Yes" && q2.value === "Yes") { 
        localStorage.setItem(key, JSON.stringify({
            status: "completed",
            time: timestamp})); 
    }

    else {
        localStorage.setItem(key, JSON.stringify({
            status: "partial",
            time: timestamp})); 
    }


    //highlightSelectedDay();
    localStorage.setItem("lastPlayed", timestamp);

    localStorage.removeItem("selectedDay");

    update_calendar();
    updatelp();
    // if (q1.value === "Yes" && q2.value === "Yes") {
    //     saveDay();
    //     highlightTodayGreen();
    // }

    // if ((q1.value === "No" && q2.value === "Yes") || (q1.value === "Yes" && q2.value === "No")) {
    //     saveDay();
    //     highlightTodayGreen();
    // }

    // if (q1.value === "No" && q2.value === "No") {
    //     saveDay();
    //     highlightTodayRed();
    // }
    
});

document.getElementById("resetprog").addEventListener("click", function () {;

    if (confirm("Are you sure you want to reset the calendar progress?")) {
        localStorage.clear();
        document.querySelectorAll('input[type="radio"').forEach(r=> r.checked = false);

        document.querySelectorAll(".Number").forEach(cell => {
            cell.classList.remove("green-day");
            cell.classList.remove("active");
        });

        current_date = new Date();
        update_calendar();
        
    }
});

function makeKey(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function stripTime(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function saveDay() {
    const today = new Date();
    const key = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    localStorage.setItem(key, "completed");

    if (!localStorage.getItem("firstActive")) {
        localStorage.setItem("firstActive", key);
    }

    localStorage.setItem("lastCompleted", key);
}

function highlightTodayGreen() {
    const today = new Date().getDate();
    const cells = document.querySelectorAll(".Number");

    cells.forEach(cell => {
        if (parseInt(cell.textContent) === today) {
            cell.classList.remove("active");
            cell.classList.add("green-day");
        }
    });
}

function highlightTodayRed() {
    const today = new Date().getDate();
    const cells = document.querySelectorAll(".Number");

    cells.forEach(cell => {
        if (parseInt(cell.textContent) === today) {
            cell.classList.remove("active");
            cell.classList.add("red-day");
        }
    });
}

function any_missed() {
    const last = localStorage.getItem("lastCompleted");
    if (!last) return;

    const [year, month, day] = last.split("-").map(Number);
    const lastDate = new Date(year, month, day);

    const today = new Date(); const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1); 
    if (yesterday > lastDate) { 
        const missedKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`; 
        localStorage.setItem(missedKey, "missed"); 
    }
}

function highlightSelectedDay() {
    const selected = new Date(localStorage.getItem("selectedDay"));
    const cells = document.querySelectorAll(".Number");

    cells.forEach(cell => {
        cell.classList.remove("selected");
        if (parseInt(cell.textContent) === selected.getDate()) {
            cell.classList.add("selected");
        }
    });
}

function updatelp() {
    const lp = localStorage.getItem("lastPlayed");
    const lp_var = document.getElementById('lp_date');

    if (!lp) {
        lp_var.textContent = "Last played: None yet";
        return;
    }

    const date = new Date(lp);
    lp_var.textContent = "Last Played: " + date.toLocaleString();
}



// function Check_all {

// }
any_missed();
update_calendar();

Numbers_var.addEventListener("click", function (e) {
    if (!e.target.classList.contains("Number")) return;

    const day = parseInt(e.target.textContent);
    const selected = new Date(current_date.getFullYear(), current_date.getMonth(), day);

    localStorage.setItem("selectedDay", makeKey(selected));
    highlightSelectedDay()
});