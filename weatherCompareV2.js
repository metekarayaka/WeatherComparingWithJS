const { resolve } = require("path");
const { rejects } = require("assert");

var five = require("johnny-five"), board, buttonMeasureTemp;
const fs = require('fs');

let initializeAndRecord = async () => {
        console.log("Started running the application...");
        await initializeBoard();
        let [temp, tempSite] = await Promise.all([measureTemp(), getResponse()]);
        console.log([temp, tempSite]);
        return [temp, tempSite]; 
}

let printAndSave = async () => {
    [temp, tempSite] = await initializeAndRecord();
    console.log("Values are obtained, printing and saving");
    printData(temp, tempSite);
    writeData(temp, tempSite);
}

printAndSave();

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
    buttonMeasureTemp.on("down", function() {    
        const {celsius, fahrenheit, kelvin} = thermometer;
        console.log("Thermometer");
        console.log("  celsius      : ", celsius);
        console.log("  fahrenheit   : ", fahrenheit);
        console.log("  kelvin       : ", kelvin);
        console.log("--------------------------------------");
        return kelvin;
    });
}

async function getResponse() {
    try {
        const fetch = require("node-fetch");
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Istanbul&appid=1e8899e5ddcb22a8e707a7e87f977e8d'); 
        
        let message = await response.json();
        let stringMessage = JSON.stringify(message);
        let location = stringMessage.search("temp");
        let cutMessage = stringMessage.slice(location + 6, location + 10);

    } catch (err) {
        console.log(err);
    }
}

function printData(measuredTemperature, siteTemperature){
    if (measuredTemperature > parseInt(siteTemperature)){
        console.log("Measured Temp: " + measuredTemperature + "\n" + "Site Temp: " + siteTemperature + "\n" + "Contradicts!");
    }
    else{
      console.log("Measured Temp: " + measuredTemperature + "\n" + "Site Temp: " + siteTemperature + "\n" + "No Contradiction!");
    }
}

function writeData(measuredTemperature, siteTemperature){
    fs.writeFile('out.txt', "Measured Temp: " + measuredTemperature + "\n" + "Site Temp: " + siteTemperature, (err) => {
        if (err) throw (err);
        console.log("Temperatures Saved!");
    })
}