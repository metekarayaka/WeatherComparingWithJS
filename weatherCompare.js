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

// Initialize the button
  button = new five.Button(2);
  board.repl.inject({
    button: button
  });

// Initialize the thermometer
  const thermometer = new five.Thermometer({
    controller: "LM35",
    pin: "A0",
  });

// Check whether themormeter is working appropriately
  const {celsius, fahrenheit, kelvin} = thermometer;
  if (celsius > 100){
    console.log("The temperature value is too high, check the circuit for any errors!");
  }

// If thermometer is working appropriately, button can be pressed to
// record the current temperature value.
  button.on("down", function() {
    const {celsius, fahrenheit, kelvin} = thermometer;
    console.log("Thermometer");
    console.log("  celsius      : ", celsius);
    console.log("  fahrenheit   : ", fahrenheit);
    console.log("  kelvin       : ", kelvin);
    console.log("--------------------------------------");
  });

  

});