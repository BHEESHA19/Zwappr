const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const ddbClient = new DynamoDBClient({ region: 'ca-central-1' });
const { v4: uuidv4 } = require('uuid');


const cors = require('cors');
require('dotenv/config'); // Use require instead of import
const http = require('http'); // Core Node.js module for creating HTTP server
const { Server } = require('socket.io'); // WebSocket library for real-time communication
const express = require('express');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

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

// Configure multer for handling files
const upload = multer({ dest: 'uploads/' }); 

// Upload endpoint for multiple images & videos
app.post('/uploadNewItem', upload.array('media', 10), async (req, res) => {

    const category = req.body.category;
    const item_name = req.body.item_name;
    const price_per_day = req.body.price;
    const description = req.body.description;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const item_id = uuidv4();
    const date_uploaded = new Date().toISOString();


    const params = {
        TableName: 'Zwappr_Items',
        Item: {
            item_id: { S: item_id },
            category: { S: category },
            item_name: { S: item_name },
            price_per_day: { N: price_per_day },
            description: { S: description },
            start_date: { S: start_date },
            end_date: { S: end_date },
            date_uploaded: { S: date_uploaded }
        }
    };

    try {
      const urls = [];
  
      for (const file of req.files) {
        const filePath = path.join(__dirname, file.path);
  
        // Determine if the file is an image or video
        const resourceType = file.mimetype.startsWith('video') ? 'video' : 'image';
  
        // Upload to Cloudinary with appropriate resource type
        const result = await cloudinary.uploader.upload(filePath, { resource_type: resourceType });
  
        urls.push(result.secure_url); // Store URL we get from Cloudinary to the urls array
        console.log('Uploaded to Cloudinary:', result.secure_url);
  
        fs.unlinkSync(filePath); // Delete local file after upload
      }
  
      res.json({ urls });
      return {
        headers: {
            "Access-Control-Allow-Origin": "*", 
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
        statusCode: 200,
        body: JSON.stringify({ message: 'Item details added successfully'})
    };
    } catch (error) {
      console.error('Upload to cloudinary failed:', error);
      res.status(500).send('Upload to cloudinary failed');
    }

   
    try {
        await ddbClient.send(new PutItemCommand(params));
        return {
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
            statusCode: 200,
            body: JSON.stringify({ message: 'Item details added successfully'})
        };
    } catch (error) {
        return {
            headers: {
                "Access-Control-Allow-Origin": "*", 
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
                },
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to add item', error: error.message })
        };
    }
  });


//   app.post('uploadtoDB', async (req, res) => {
   

//     }


  









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

