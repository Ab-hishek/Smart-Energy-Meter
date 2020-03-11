var mqtt = require('mqtt');
const ACCESS_TOKEN = "m3gkdPZ5WzHz4cNe7BSW";//"14APGYXzECIEJ8T5ZcvN";
var json;
var thingsboardclient  = mqtt.connect('mqtt://ec2-34-229-180-52.compute-1.amazonaws.com',{
    username: ACCESS_TOKEN
});


thingsboardclient.on('connect', function () {
    console.log('connected');
    thingsboardclient.subscribe('v1/devices/me/rpc/request/+')
});

const { EventHubClient } = require("@azure/event-hubs");
// Connection string - primary key of the Event Hubs namespace. 
// For example: Endpoint=sb://myeventhubns.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//const connectionString = "Endpoint=sb://thingsboard.servicebus.windows.net/;SharedAccessKeyName=hubowner;SharedAccessKey=/1xBEHy+yQgOTGo/3bkip6kmpYVVVpNXe1Ak7PMn5UQ=;EntityPath=simulator";
const connectionString = "Endpoint=sb://energyeventhub.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=fShqmG4msJ/CHduyNFpb4hvQmmwNKH3FA2Xz9n+QT3w=";
// Name of the event hub. For example: myeventhub
const eventHubsName ="smartmeterenergyhub";// "simulator";
//require('events').EventEmitter.prototype._maxListeners = 5000000;
let date;
let month;
let year;
let hours;
let minutes;
let seconds;

function readDate(ts,i)
{

    //console.log("my date");
    
    let date_ob = new Date(ts);
    date_ob.setMinutes( date_ob.getMinutes()-date_ob.getMinutes());
    date_ob.setMinutes( date_ob.getMinutes() + (i*30) );
    // current date
    // adjust 0 before single digit date
    date = ("0" + date_ob.getDate()).slice(-2);
    
    // current month
    month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    
    // current year
    year = date_ob.getFullYear();
    
    // current hours
    hours = date_ob.getHours();
    
    // current minutes
    minutes = date_ob.getMinutes();
    
    // current seconds
    seconds = date_ob.getSeconds();
}
try{
var generateData= function(iotEventHubclient,u,i,d)
{
  // Simulate telemetry.
  //users=u;
  var min=0.1; 
    var max=0.5;
  var count,j,details=[u];
  var LCLID=["MAC002560","MAC004692","MAC000089","MAC001877","MAC005232","MAC005167","MAC003486","MAC002225","MAC003333","MAC003322"];
  //interval=i,duration=d;
  //count+=1;
  let ts = Date.now();
  for(j=0;j<u;j++){
    for(count=0;count<(48*(d*30));count++){
        readDate(ts,count);
        var finaldate;
        //var finaldate=month+"/"+date+"/"+year+" "+hours+":"+minutes;
        if(minutes==0){finaldate=month+"/"+date+"/"+year+" "+hours+":"+minutes+"0";}
        else{finaldate=month+"/"+date+"/"+year+" "+hours+":"+minutes;}
        //console.log(finaldate);
        details[j]={
          ID: LCLID[j],
          Energy: Math.random() * (+max - +min) + +min,
          timestamp: finaldate
        }
        //const eventData=details[j];
        //console.log(`Sending message: id=${eventData.ID},energy=${eventData.Energy},timestamp=${eventData.timestamp}`);
        const eventData ={body:{
          LCLid: details[j].ID,
          energy: details[j].Energy,
          Timestamp: details[j].timestamp}};

          //console.log(`Sending message: id=${eventData.body.LCLID},energy=${eventData.body.ENERGY},timestamp=${eventData.body.TIMESTAMP}`);
          console.log(`Received message: ${JSON.stringify(eventData.body)}`);
          thingsboardclient.publish("v1/devices/me/telemetry",JSON.stringify(eventData.body));
           iotEventHubclient.send(eventData);
          for(k=0;k<100000;k++){};
          
      }
    }
    iotEventHubclient.close();
  }
   
}
    catch(err){
      console.log("error while sending data");
    }

  //var temperature = 20 + (Math.random() * 15);
  /*var message ={
    //temperature: temperature,
    ID: details[j].ID,
    Energy: details[j].Energy,
    Timestamp: details[j].timestamp
    //humidity: 60 + (Math.random() * 20)
  };*/
 // console.log('Sending message: ' + message.getData());
var users=0,interval=0,duration=0,counter=0;
thingsboardclient.on('message', function (topic, message) {
    console.log('request.topic: ' + topic);
    console.log('request.body: ' + message.toString());
    json = JSON.parse(message);
          
        if(json.method == "setUserNo")
         {
            users=json.params;
            console.log("users="+users);
            json.method=null;
            json.params=null;
            counter++;
          }
            else if(json.method == "setInterval")
            { 
               interval=json.params;
               console.log("interval="+interval);
               json.method=null;
               counter++;
              }
               else if(json.method == "setDuration")
                 {
                   duration=json.params;
                   console.log("duration="+duration);
                   json.method=null;
                   counter++;
                  }
                   else{
                      console.log("No match case");
                   }
                   console.log("counter="+counter);
                   if(counter==3)
                   {
                    console.log("send data");
                    //******************************************* */
                    try{
                      pushEventHub();}
                    catch(err){
                      console.log("error occured="+err);
                    }  
                    //********************************************* */
                     counter=0;
                    console.log("data sent successfully");
                  }
                  
        });

  function pushEventHub(){
      console.log("pushData");
      const iotEventHubclient = EventHubClient.createFromConnectionString(connectionString, eventHubsName);
      while(users==0 && interval ==0 && duration==0); 
      console.log(users+","+interval+","+duration);
    
      generateData(iotEventHubclient,users,interval,duration);
      //iotEventHubclient.close();
      console.log("azure event closed");
    }