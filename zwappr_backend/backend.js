const { DynamoDBClient, PutItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');
// const { buildResponse } = require('./utils/util.js');
const bcrypt = require('bcryptjs');
// const { _generateToken } = require('./utils/auth.js');
const { compareSync } = bcrypt;
const { hashSync } = bcrypt;

const jwt = require('jsonwebtoken');
const { sign } = jwt;
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

const ddbClient = new DynamoDBClient({ region: 'ca-central-1' });
const bookingTable = 'Zwappr_Bookings';
const usersTable = 'Zwappr_Users';
const itemsTable = 'Zwappr_Items';





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
app.post('/uploadToCloudinary', upload.array('media', 10), async (req, res) => {

   

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

  });


  app.post('/uploadtoDB', async (req, res) => {
    
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


  









//////////////////////////////////////////////////////////////////
//SERVER ENDPOINTS
//////////////////////////////////////////////////////////////////
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        console.log("Sending invalid login response1");
        return res.status(401).json({ message: 'Username and Password are required' });
    }

    const params = {
        TableName: usersTable,
        Key: {
            username: { S: username }
        }
    };

    try {
        const data = await ddbClient.send(new GetItemCommand(params));

        if (!data.Item) {
            console.log("Sending invalid login response2");
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: 'Invalid Username or Password' })
            }
        }

        const hashedPassword = data.Item.password.S;
        console.log("Hashed password from DB: ", hashedPassword);
        console.log("Password from request: ", password);
        const isValidPassword = compareSync(password, hashedPassword);
        console.log("Is valid password: ", isValidPassword);

        if (!isValidPassword) {
            console.log("Sending invalid login response3");
            return {
                statusCode: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: 'Invalid Username or Password' })
            }
        }

        else{

        const userInfo = {
            username: data.Item.username.S,
            email: data.Item.email.S
        };

        const token = _generateToken(userInfo);
        const response = {
            user: userInfo,
            token: token
        };
        console.log("Sending successful login response");
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Login successful' })
        }
    }

    } catch (error) {
        console.error('Error retrieving user:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/register', async (req, res) => {
    console.log(req.body);
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return buildResponse(401, { message: 'Missing the required fields' });//checking for missing fields
    }

    const ur = username.toLowerCase().trim();
    const params = {
        TableName: usersTable,
        Key: {
            username: { S: ur }
        }
    };

    try {
        const data = await ddbClient.send(new GetItemCommand(params));
        if (!data.Item) {
            const encryptedPassword = hashSync(password.trim(), 10);//password is encrypted here
            const user = {
                email,
                password: encryptedPassword,
                username: username.toLowerCase().trim(),
                user_id: uuidv4()
            };
            
            const saveUserResponse = await saveUser(user);
            if (!saveUserResponse) {
                return buildResponse(503, { message: 'Server Error. Error saving user. Please try again later' });
            }
            res.json('User registered successfully');
            return buildResponse(200, { message: 'User registered successfully' });
        
        }

        if (data.Item && data.Item.username) {
            return buildResponse(401, { message: 'Username already exists! Please choose a different username.' });
            res.json('Username already exists! Please choose a different username.');
        }
       

    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Error registering the user' });

    }

});



app.post('/UPLOADPHOTO', async (req, res) => {

    // const uploadResult = await cloudinary.uploader
    // .upload(
    //     './grad.png', {
    //         public_id: 'gradphoto',

    //     }
    // )
    // . catch((error) => {
    //     console.log(error);
    // });

    // console.log(uploadResult);
    // res.json({ url: uploadResult.secure_url });


    // // Optimize delivery by resizing and applying auto-format and auto-quality
    // const optimizeUrl = cloudinary.url('shoes', {
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });
    
    // console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    // const autoCropUrl = cloudinary.url('gradphoto', {
    //     crop: 'auto',
    //     gravity: 'auto',
    //     width: 500,
    //     height: 500,
    // });
    
    // console.log(autoCropUrl);    
   
});






/////////HELPER FUNCTIONS
async function saveUser(user) {//DynamoDB operation saveUser
    const params = {
        TableName: usersTable,
        Item: {
            username: { S: user.username },
            user_id: { S: user.user_id },
            email: { S: user.email },
            password: { S: user.password }
        }
    };

    try {
        await ddbClient.send(new PutItemCommand(params));
        return true;
    } catch (error) {
        console.error('There is an error in saveUser: ', error);
        return false;
    }
}

// function buildResponse(statusCode, body) {
//     return {
//         statusCode: statusCode,
//         headers: {
//             'Access-Control-Allow-Origin': '*',
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(body)//API gateway is expecting a stringified version on the body
//     }
// }

function _generateToken(userInfo) {
    if (!userInfo) {
        return null;
    }

    // Ensure JWT_SECRET is set in your environment variables
    const token = sign(
        { username: userInfo.username, email: userInfo.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } 
    );
    return token;
}