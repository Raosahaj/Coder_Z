require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const db = require('./db');
const router = require('./routers');

const PORT = process.env.PORT || 80;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket Server Setup
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  ws.on('message', (message, isBinary) => {
    try {
      // Convert message to string if binary
      const textMessage = isBinary ? message.toString() : message;
      
      // Broadcast to all clients
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(textMessage, { binary: false });
        }
      });
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Database Connection
db.connect();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json());

// API Routes
app.use('/api', router);

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../frontend/build')));

// SPA Fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

// Server Start
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server listening on ws://localhost:${PORT}`);
});

