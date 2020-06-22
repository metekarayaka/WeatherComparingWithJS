//Examples for web requests

//xmlhttp is native in browsers but not at node.js, so we need to add its module!
//to install use -> npm install xmlhttprequest --save

//import
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const MyEmitter = require("events");
const readline = require("readline");

//promises
let timeout = new Promise( (resolve,reject)=>{
    let wait = setTimeout(() => {
        resolve('...2000 ms past\n');
      }, 2000)
});

/**
 * This func makes a http request inside a promise. 
 * 
 * When the request emits onload event with succesfull status, our beloved promise gets resolved. Else it gets rejected.
 * 
 * @param {*} method http call method
 * @param {*} url url to go
 */
let callPromise = async (method,url) => {

    return await new Promise(function(resolve, reject) 
    {
        console.log("inside the call promise => url : "+url+", method : "+method);

        let request = new XMLHttpRequest();
        request.open(method, url);
        
        request.onload = async function () {

            console.log("\nAsynch response came but i will wait a bit ...");
            //This will wait for only once.Then it will stay as resolved.
            //To make it work at every time use below commented code block
            let lollygagging = await timeout;
            console.log(lollygagging);
            
            /*

            let timeout2 = new Promise( (resolve,reject)=>{
                let wait = setTimeout(() => {
                    resolve('...2000 ms past\n');
                  }, 2000)
            });
            let lollygagging = await timeout2;
            console.log(lollygagging);

            */
            

            if (this.status >= 200 && this.status < 300) {
                resolve(request.responseText);// It will return whole dom element of the web page!
            } 
            else 
            {
                reject({
                    status: this.status,
                    statusText: request.statusText
                });
            }
        };

        request.onerror = function () {
            console.log("SOME ERRORS HAPPEND");
            reject({
                status: this.status,
                statusText: request.statusText
            });
        };
        
        request.send();
    
    });
};



//Funcs
const async_call = async (method,url) =>{

    console.log("\n@@@ ASYNC REQUEST START @@@");
    
    let respond = await callPromise(method,url);
    //console.log(respond); It will write whole dom of the web page!

    console.log("\n@@@ ASYN REQUEST END @@@");
};

const event_call = (method,urlToCall) =>
{
    console.log("\n000 EVENT BASED REQUEST START 000");
    const request = new XMLHttpRequest();
    
    
    //built-in ready state change event listener
    request.onreadystatechange = async () =>
    {
        
        /*  
        ready state codes;
            0	UNSENT	
            1	OPENED
            2	HEADERS_RECEIVED	
            3	LOADING
            4	DONE
        */

        /*
        It will wait only one time then it will stay resolved!
        let lollygagging = await timeout
        console.log(lollygagging);
        */

        if(request.readyState === 4) 
        {   
            let status = request.status;
            if (status === 0 || (status >= 200 && status < 400)) 
            {
                // The request has been completed successfully
                console.log("event based response came");
                //console.log(request.responseText); It will write whole dom of the web page!
            } 
            else 
            {
                console.log("Oh no! There has been an error with the request!");
            }
        }
        else if(request.readyState === 3)
        {
            console.log("during request");
        }
        else if (request.readyState === 2)
        {
            console.log("headers just came!");
        }
    }

    request.open(method,urlToCall);
    request.send();
    console.log("\n000 EVENT BASED REQUEST END 000");
    
};


const simpleWebRequests = async () =>
{
    console.log("Lets call ASYNCH request");
    await async_call("GET","https://www.google.com/");

    console.log("lets call EVENT BASED request");
    event_call("GET","https://www.google.com/");
};


const evenBasedRequestWrapper = () =>
{
    console.log("<<<<< Event based >>>>>");
    
    const myEmitter = new MyEmitter();

    myEmitter.on('time-has-come',async () => {
        
            console.log('Damn son! i need to get my bitch ass flammin machine from the hood! lets make a request.\n');
            let xx = await simpleWebRequests();
            rl.close();
            
    });

    //at real world, this event should be triggered on some interaction but for the sake of simplicity i will trigger it manually.
    //So it will as user to enter a predefined word.
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


    rl.question("\nThe time has come ? (yes/no)\n", (input) => 
    {
        //console.log(input);
        
        if (input == "yes") 
        {
            console.log("Let the PURGE begin!");
            myEmitter.emit("time-has-come")
            
        }
        else{console.log("Damn homie!");} 
        
    });

    
    rl.on("close", () =>
    {
        console.log("\nBYE BYE !!!");
        process.exit(0);
    });

};



////////////////////////////////////////////////////////////////////////////////////////////
//run-time scope
simpleWebRequests()
evenBasedRequestWrapper()
//lets call web request from a home made event.



