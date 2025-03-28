const cors = require('cors');
require('dotenv/config'); // Use require instead of import
const http = require('http'); // Core Node.js module for creating HTTP server
const { Server } = require('socket.io'); // WebSocket library for real-time communication
const express = require('express');
const cloudinary = require('cloudinary').v2;

const app = express();
app.use(express.json());
app.use(cors());


//SERVER SETUP
////////////////////////////////////////////////////////////////
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    maxHttpBufferSize: 1e6,
    pingTimeout: 30000,
    pingInterval: 25000,
    transports: ['websocket']
});

const port = 5001;

server.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});

cloudinary.config({ 
    cloud_name: 'dydtapwia', 
    api_key: '394936464467753', 
    api_secret: 'kDfUorELYIwNcVCQSMiBKzEV_AI' 
});

// Upload an image











//////////////////////////////////////////////////////////////////
//SERVER ENDPOINTS
//////////////////////////////////////////////////////////////////
app.post('/login', async (req, res) => {
    
});

app.post('/UPLOADPHOTO', async (req, res) => {

    const uploadResult = await cloudinary.uploader
    .upload(
        './img5.webp', {
            public_id: 'shoes',

        }
    )
    . catch((error) => {
        console.log(error);
    });

   

    console.log(uploadResult);
   
});

app.post('/UPLOADVIDEOS', async (req, res) => {
    
});

app.post('/confirmReservation', async (req, res) => {
    //change the price 
    //change the flag status
});

app.post('/retrieveItems', async (req, res) => {
    //change the price 
    //change the flag status
});

