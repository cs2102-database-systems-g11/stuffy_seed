function randomDate() {
    let date = new Date();
    // 7 days to 2 months
    const offset = randomInt(604800, 5184000) * 1000;
    date = addTimeToDate(date, offset);
    return date;
}

// YYYY-MM-DD
function formatDate(date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// YYYY-MM-DD HH:MM:SS
function formatDatetime(date) {
    const year = date.getFullYear();
    const month = padDateComponent(date.getMonth() + 1);
    const day = padDateComponent(date.getDate());
    const hours = padDateComponent(date.getHours());
    const minutes = padDateComponent(date.getMinutes());
    const seconds = padDateComponent(date.getSeconds());
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function padDateComponent(component) {
    return ('0' + component).slice(-2);
}


function addTimeToDate(date, time) {
    let d = date.getTime();
    d += time;
    return new Date(d);
}

function randomChoice(arr) {
    const item = arr[Math.floor(Math.random()*arr.length)];
    return item;
}

function randomPhoneNumber() {
    let phone = ''
    const digit1 = randomInt(8, 10);
    phone += digit1;
    let digit;
    for (var i=0;i<7;i++) {
        digit = randomInt(0, 10);
        phone += digit;
    }
    return phone;
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

export default {
    randomDate,
    addTimeToDate,
    randomChoice,
    randomPhoneNumber,
    randomInt,
    formatDate,
    formatDatetime
}
