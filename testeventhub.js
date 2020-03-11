const { EventHubClient } = require("@azure/event-hubs");

// Connection string - primary key of the Event Hubs namespace. 
// For example: Endpoint=sb://myeventhubns.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
const connectionString = "Endpoint=sb://myeventhubns.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
// Name of the event hub. For example: myeventhub
const eventHubsName = "smartmeterenergyhub";

async function main() {
  const client = EventHubClient.createFromConnectionString(connectionString, eventHubsName);

  
   
  for (let i = 0; i < 100; i++) {
    const eventData = {body: `Event ${i}`};
    console.log(`Sending message: ${eventData.body}`);
    await client.send(eventData);
  }
  }

  await client.close();

}
main().catch(err => {
  console.log("Error occurred: ", err);
});