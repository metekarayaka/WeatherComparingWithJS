const { resolve } = require("path");
const { rejects } = require("assert");

// IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! 
// Johnny Five is a module that allows the control of the Arduino from the 
// JavaScript code. In order to prepare the Arduino for the Johnny Five, the
// following must be done. Run Arduino IDE -> Locate Files > Examples > Firmata
// > StandardFirmataPlus. Open this code and load it to Arduino. The microcontroller
// is ready for manipulation from code.
let five = require("johnny-five"), board, buttonMeasureTemp, buttonAbortMission;

// This is the stack that stores the requests.
let requestStack = [];

// Date is used to give time to the requests.
let date = new Date();

// Request class that is pushed to the request stack.
class requestNode{
    constructor(time){
        this.time = time;
    }
}

// VARIABLE DECLARETIONS
const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const { runInContext } = require("vm");
const { request } = require("http");

// Simple timeout function to test aborting mechanism. 
let timeout = new Promise( (resolve, reject)=>{
    let wait = setTimeout(() => {
        resolve('...10000 ms past\n');
      }, 10000)
});

// A function that calls the function which measures the temperature using
// LM35 device and the function which receives the temperature from an API
// call.
let initializeAndRecord = async (temp) => {
    temp = await measureTemp();
    tempSite = await getResponse();
    return [temp, tempSite];
}       

// After the temperature is measured and received from the web, this function
// is run to print the temperatures and write them onto a file. 
let printAndSave = async () => {
    [temp, tempSite] = await initializeAndRecord();
    console.log("Values are obtained, printing and saving!");
    printData(temp, tempSite);
    writeData(temp, tempSite);
    requestStack.pop();
}

// This is the main function. This function runs once the program is begun execution.
async function runApp(){
    console.log("Started running the application...");

    await initializeBoard(); // Initialization function of the board.

    buttonMeasureTemp.on("down", async function() {  // Checking the weather measure button for action. Whenever the button is pressed, this function is activated.

        let newRequest = new requestNode(date.getHours() + ":" + date.getMinutes()); // Creating new request.

        requestStack.push(newRequest); // Pushing this request to the stack.

        console.log(requestStack); // Just a print to trace the state of the stack
        
        let lollygagging = await timeout; // IMPORTANT. This is the timeout function. Makes the web request wait 10 seconds so that there is a time window to
        console.log(lollygagging);        // cancel the call using the second button.

        if (requestStack === undefined || requestStack.length == 0){    // If statement that checks whether the stack is empty. If it's empty, there is no call to be made.
            console.log("All requests are either completed or cancelled!")
        }
        else{   // If the stack is not empty, this function calls the function that calls the measurement and recording.
            printAndSave();
        }
    });
    buttonAbortMission.on("down", async function() {  //  Checking the abort button for action. Whenever the button is pressed, this function is activated and current API call is cancelled.
        abortFunction();
    });
}

// This function pops an API call found in the request stack.
async function abortFunction(){
    console.log("Aborting!");
    requestStack.pop();  // Poping the API call in the stack.
    console.log(requestStack); // Printing the current state of stack for better tracing. 
}

// This is the function that initializes the board. 
async function initializeBoard() {  

    return await new Promise(function(resolve, reject) {

        board = new five.Board(  // IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! IMPORTANT! 
            {                    // This is the port number in which the Arduino is connected. For me it was COM3, for you, it might be different.
                port: "COM3"     // Check your device manager to see which port is connected to Arduino and CHANGE this port value accordingly. 
            }                    // You can also use the Arduino IDE to see which port is being used.
        );

        board.on("ready", function() {

            buttonMeasureTemp = new five.Button(2); // Adding the button that measures weather to the board in the 2nd input location.
            board.repl.inject({
                button: buttonMeasureTemp
            });

            buttonAbortMission = new five.Button(3); // Adding the button that aborts API calls to the board in the 3rd input location.
            board.repl.inject({
                button: buttonAbortMission
            });

            thermometer = new five.Thermometer({ // INPORTANT, Adding the thermometer to the board - LM35 for my case, yours can be different.
                controller: "LM35",
                pin: "A0",
            });

            const {celsius, fahrenheit, kelvin} = thermometer;  // Initially getting the temperature values for any errors.
            if (celsius > 100){
                console.log("The temperature value is too high, check the circuit for any errors!");
                reject('Aborting...');  // If you are an idiot like me and connected both ends of the LM35 to 5V, your LM35 will be around 300C
            }                           // so don't touch it and consider checking the board for any errors.
            else{
                console.log("Circuit is good to go!");  // If there are no anomalies in the circuit, the board is successfully created. 
                resolve(board);
            }
        });
    });
};

// This is the function that measures the temperature based on LM35
async function measureTemp(){
    return await new Promise(function(resolve, reject) {  
            const {celsius, fahrenheit, kelvin} = thermometer;
            console.log("Thermometer"); // Printing the values.
            console.log("  celsius      : ", celsius);
            console.log("  fahrenheit   : ", fahrenheit);
            console.log("  kelvin       : ", kelvin);
            console.log("--------------------------------------");
            resolve(kelvin); // Returns the kelvin value.
        });
}

// This is the function that gets the temperature from a website using XMLHTTPREQUEST.
async function getResponse() {
    return await new Promise(async function(resolve, reject) {
        try {

            let request = new XMLHttpRequest; // Create new request.
            request.open("GET", "https://api.openweathermap.org/data/2.5/weather?q=Istanbul&appid=1e8899e5ddcb22a8e707a7e87f977e8d"); // Enter the URL and function type.

            request.send(); // Send the call.

            request.onload = async function () { // This is the block that is executed when the call is returned. 
                if (this.status >= 200 && this.status < 300) { // If the code is between 200 and 300, call is a success and we can continue. 
                    let location = request.responseText.search("temp");
                    let cutMessage = request.responseText.slice(location + 6, location + 11); // Message has a lot of information, search for temperature and extract it. 
                    resolve(cutMessage); // Return the temperature only. 
                } 
                else 
                {
                    reject({ // If there is an error with the call, this will be executed. 
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

// The function that prints the data to the console. 
function printData(measuredTemperature, siteTemperature){
    if (measuredTemperature > parseInt(siteTemperature)){
        console.log("Measured Temp: " + measuredTemperature + "!\n" + "Site Temp: " + siteTemperature + "!\n" + "Contradicts!");
    }
    else{
      console.log("Measured Temp: " + measuredTemperature + "!\n" + "Site Temp: " + siteTemperature + "!\n" + "No Contradiction!");
    }
}

// The function that writes the data to a file. 
function writeData(measuredTemperature, siteTemperature){
    fs.writeFile('out.txt', "Measured Temp: " + measuredTemperature + "\n" + "Site Temp: " + siteTemperature, (err) => {
        if (err) throw (err);
        console.log("Temperatures Saved!");
    })
}

// MAIN CALL.
runApp();