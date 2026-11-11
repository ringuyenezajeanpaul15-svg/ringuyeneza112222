// CONNECT TO HIVEMQ

const broker = "ws://broker.hivemq.com:8000/mqtt";

const client = mqtt.connect(broker);


// MQTT TOPICS

const temperatureTopic =
"group3/jeanpaul/temperature";

const humidityTopic =
"group3/jeanpaul/humidity";

const statusTopic =
"group3/jeanpaul/status";


// DASHBOARD VALUES

let temp = 0;
let hum = 0;


// CHART LABELS

let labels = [];


// TEMPERATURE GRAPH

const tempChart = new Chart(
    document.getElementById("temperatureChart"),
    {
        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Temperature °C",
                data: [],
                borderWidth: 2,
                tension: 0.4
            }]
        },

        options: {
            responsive: true
        }
    }
);


// HUMIDITY GRAPH

const humChart = new Chart(
    document.getElementById("humidityChart"),
    {
        type: "line",

        data: {
            labels: labels,

            datasets: [{
                label: "Humidity %",
                data: [],
                borderWidth: 2,
                tension: 0.4
            }]
        },

        options: {
            responsive: true
        }
    }
);


// CONNECT TO BROKER

client.on("connect", function () {

    document.getElementById("connection").innerText =
        "CONNECTED TO HIVEMQ";

    document.getElementById("connection").style.background =
        "green";

    client.subscribe([
        temperatureTopic,
        humidityTopic,
        statusTopic
    ]);

});


// CONNECTION ERROR

client.on("error", function (error) {

    console.log("MQTT Error:", error);

});


// CONNECTION LOST

client.on("offline", function () {

    document.getElementById("connection").innerText =
        "MQTT OFFLINE";

    document.getElementById("connection").style.background =
        "red";

});


// RECEIVE MQTT DATA

client.on("message", function (topic, message) {

    const value = parseFloat(message.toString());

    if (topic === temperatureTopic) {

        if (!Number.isFinite(value)) return;

        temp = value;

        document.getElementById("temperature").innerText =
            temp.toFixed(2);

    }


    if (topic === humidityTopic) {

        if (!Number.isFinite(value)) return;

        hum = value;

        document.getElementById("humidity").innerText =
            hum.toFixed(2);

        // UPDATE GRAPHS WHEN BOTH VALUES ARRIVE

        const time = new Date().toLocaleTimeString();

        labels.push(time);

        tempChart.data.labels = [...labels];

        humChart.data.labels = [...labels];

        tempChart.data.datasets[0].data.push(temp);

        humChart.data.datasets[0].data.push(hum);

        // KEEP LAST 20 READINGS

        if (labels.length > 20) {

            labels.shift();

            tempChart.data.datasets[0].data.shift();

            humChart.data.datasets[0].data.shift();

        }

        tempChart.update();

        humChart.update();

        document.getElementById("lastUpdate").innerText =
            new Date().toLocaleString();

    }

});