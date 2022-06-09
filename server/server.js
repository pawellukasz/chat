require('dotenv').config();
const webSocketsServerPort = process.env.WS_PORT || 8000;
const webSocketServer = require('websocket').server;
const http = require('http');

const server = http.createServer();
server.listen(webSocketsServerPort);
const wsServer = new webSocketServer({
  httpServer: server
});

let userIndex = 0;

const generateUserName = () => {
  userIndex++;
  return 'User_' + userIndex;
};

const clients = {};

let allMessages = [];

const sendMessage = (json) => {

  Object.keys(clients).map((client) => {
    clients[client].sendUTF(json);
  });
}

wsServer.on('request', (request) => {
  var userName = generateUserName();
  console.log((new Date()) + ' connection from origin ' + request.origin);

  const connection = request.accept(null, request.origin);
  clients[userName] = connection;
  console.log('connected: ' + userName);

  const initialMessage = {
    userName: userName,
    messages: allMessages
  }
  connection.sendUTF(JSON.stringify(initialMessage));

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      const dataFromClient = JSON.parse(message.utf8Data);
      allMessages.push(dataFromClient);
      sendMessage(JSON.stringify(dataFromClient));
    }
  });

  connection.on('close', () => {
    console.log((new Date()) + " " + userName + " disconnected");
    delete clients[userName];
  });
});

console.log("server started");
