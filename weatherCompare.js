// This code compares the temperature values taken from a website and 
// locally measured temperature values. 

console.log("Started running the application...");

// Create a variable for the board.
var five = require("johnny-five"),
  board, button;

// Initialize the board with the given port.
board = new five.Board(
    {
        port: "COM3"
    }
);

// Block that is executed when the microcontroller is ready.
board.on("ready", function() {

// Initialize the button.
  button = new five.Button(2);
  board.repl.inject({
    button: button
  });

// Initialize the thermometer.
  const thermometer = new five.Thermometer({
    controller: "LM35",
    pin: "A0",
  });

// Check whether themormeter is working appropriately.
  const {celsius, fahrenheit, kelvin} = thermometer;
  if (celsius > 100){
    console.log("The temperature value is too high, check the circuit for any errors!");
  }

// If thermometer is working appropriately, button can be pressed to
// record the current temperature value.
  button.on("down", function() {
    
    // Reads the current temperature value from the microcontroller.
    const {celsius, fahrenheit, kelvin} = thermometer;
    console.log("Thermometer");
    console.log("  celsius      : ", celsius);
    console.log("  fahrenheit   : ", fahrenheit);
    console.log("  kelvin       : ", kelvin);
    console.log("--------------------------------------");

    // Assign site and measured temperatures to new variables.
    let siteTemperature = getResponse(); // PROBLEM IS HERE - THIS IS EXECUTED BEFORE THE RESPONSE IS RECEIVED - RESPONSE MUST BE RECEIVED
    let measuredTemperature = kelvin;
  
    // Comparing the measured and site temperatures.
    if (measuredTemperature > parseInt(siteTemperature)){
        console.log("Measured Temp: " + measuredTemperature + "\n" + "Site Temp: " + siteTemperature + "\n" + "Contradicts!");
    }
    else{
      console.log("Measured Temp: " + measuredTemperature + "\n" + "Site Temp: " + siteTemperature + "\n" + "No Contradiction!");
    }

    // Write to the file using stream
    const fs = require('fs');
    fs.writeFile('out.txt', "Measured Temp: " + measuredTemperature + "\n" + "Site Temp: " + siteTemperature, (err) => {
        if (err) throw (err);
        console.log("Temperatures Saved!");
    })
  });
});

// The function that gets the temperature information from the website.
async function getResponse() {
    try {
        const fetch = require("node-fetch");
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Istanbul&appid=1e8899e5ddcb22a8e707a7e87f977e8d');
        let message = await response.json();

        // Convert the message to string from JSON.
        let stringMessage = JSON.stringify(message);

        // Find the temperature value. 
        let location = stringMessage.search("temp");

        // Separate the temperature value.
        let cutMessage = stringMessage.slice(location + 6, location + 10);

    } catch (err) {
        console.log(err);
    }
}