const { EventHubClient, delay } = require("@azure/event-hubs");

// Connection string - primary key of the Event Hubs namespace. 
// For example: Endpoint=sb://myeventhubns.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
const connectionString = "Endpoint=sb://myeventhubns.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

// Name of the event hub. For example: myeventhub
const eventHubsName = "smartmeterenergyhub";

async function main() {
  const client = EventHubClient.createFromConnectionString(connectionString, eventHubsName);
  const allPartitionIds = await client.getPartitionIds();
  const firstPartitionId = allPartitionIds[0];

  const receiveHandler = client.receive(firstPartitionId, eventData => {
    console.log(`Received message: ${JSON.stringify(eventData.body)} from partition ${firstPartitionId}`);
  }, error => {
    console.log('Error when receiving message: ', error)
  });

  // Sleep for a while before stopping the receive operation.
  //await delay(15000);
  await receiveHandler.stop();

  await client.close();
}

main().catch(err => {
  console.log("Error occurred: ", err);
});