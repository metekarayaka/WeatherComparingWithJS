const { resolve } = require("path");
const { rejects } = require("assert");

let five = require("johnny-five"), board, buttonMeasureTemp;
let requestStack = [];
let date = new Date();

class requestNode{
    constructor(time){
        this.time = time;
    }
}

const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { runInContext } = require("vm");
const { request } = require("http");

let timeout = new Promise( (resolve, reject)=>{
    let wait = setTimeout(() => {
        resolve('...10000 ms past\n');
      }, 10000)
});

let initializeAndRecord = async (temp) => {
    temp = await measureTemp();
    tempSite = await getResponse();
    return [temp, tempSite];
}       

let printAndSave = async () => {
    [temp, tempSite] = await initializeAndRecord();
    console.log("Values are obtained, printing and saving!");
    printData(temp, tempSite);
    writeData(temp, tempSite);
    requestStack.pop();
}

runApp();

async function runApp(){
    console.log("Started running the application...");
    await initializeBoard();
    buttonMeasureTemp.on("down", async function() {  

        let newRequest = new requestNode(date.getHours() + ":" + date.getMinutes());
        requestStack.push(newRequest);

        console.log(requestStack); // WUT
        let lollygagging = await timeout;
        console.log(lollygagging);

        if (requestStack === undefined || requestStack.length == 0){
            console.log("All requests are either completed or cancelled!")
        }
        else{
            printAndSave();
        }
    });
    buttonMeasureTemp.on("hold", async function() {  
        abortFunction();
    });
}

async function abortFunction(){
    console.log("Aborting!");
    requestStack.pop();
    console.log(requestStack); // WUT
}

async function initializeBoard() {

    return await new Promise(function(resolve, reject) {

        board = new five.Board(
            {
                port: "COM3"
            }
        );

        board.on("ready", function() {

            buttonMeasureTemp = new five.Button(2);
            board.repl.inject({
                button: buttonMeasureTemp
            });

            thermometer = new five.Thermometer({
                controller: "LM35",
                pin: "A0",
            });

            const {celsius, fahrenheit, kelvin} = thermometer;
            if (celsius > 100){
                console.log("The temperature value is too high, check the circuit for any errors!");
                reject('Aborting...');
            }
            else{
                console.log("Circuit is good to go!");
                resolve(board);
            }
        });
    });
};

async function measureTemp(){
    return await new Promise(function(resolve, reject) {
            const {celsius, fahrenheit, kelvin} = thermometer;
            console.log("Thermometer");
            console.log("  celsius      : ", celsius);
            console.log("  fahrenheit   : ", fahrenheit);
            console.log("  kelvin       : ", kelvin);
            console.log("--------------------------------------");
            resolve(kelvin);
        });
}

async function getResponse() {
    return await new Promise(async function(resolve, reject) {
        try {

            let request = new XMLHttpRequest;
            request.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=Istanbul&appid=1e8899e5ddcb22a8e707a7e87f977e8d");

            request.send();

            request.onload = async function () {
                if (this.status >= 200 && this.status < 300) {
                    let location = request.responseText.search("temp");
                    let cutMessage = request.responseText.slice(location + 6, location + 11);
                    resolve(cutMessage);
                } 
                else 
                {
                    reject({
                        status: this.status,
                        statusText: request.statusText
                    });
                }
            }

        } catch (err) {
            console.log(err);
        }
    });
}

function printData(measuredTemperature, siteTemperature){
    if (measuredTemperature > parseInt(siteTemperature)){
        console.log("Measured Temp: " + measuredTemperature + "!\n" + "Site Temp: " + siteTemperature + "!\n" + "Contradicts!");
    }
    else{
      console.log("Measured Temp: " + measuredTemperature + "!\n" + "Site Temp: " + siteTemperature + "!\n" + "No Contradiction!");
    }
}

function writeData(measuredTemperature, siteTemperature){
    fs.writeFile('out.txt', "Measured Temp: " + measuredTemperature + "\n" + "Site Temp: " + siteTemperature, (err) => {
        if (err) throw (err);
        console.log("Temperatures Saved!");
    })
}