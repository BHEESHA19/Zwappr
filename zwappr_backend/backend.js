const { DynamoDBClient, PutItemCommand, GetItemCommand, DeleteItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

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
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
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
////////////////////////////////////////////////////////////////////


// Upload endpoint for multiple images & videos
app.post('/uploadToCloudinary', upload.single('media'), async (req, res) => {
    try {
        const file = req.file; // Access the single uploaded file
        const filePath = path.join(__dirname, file.path);

        const resourceType = 'image';

        // Upload to Cloudinary with appropriate resource type
        const result = await cloudinary.uploader.upload(filePath, { resource_type: resourceType });

        console.log('Uploaded to Cloudinary:', result.secure_url);

        fs.unlinkSync(filePath); // Delete local file after upload

        // Return the single URL
        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Upload to Cloudinary failed:', error);
        res.status(500).send('Upload to Cloudinary failed');
    }
});


app.post('/addListing', async (req, res) => {
   

    console.log("Add Listing Request Body: ", req.body);

    const user_id = req.body.user_id;
    const username = req.body.username;
    const email = req.body.email;
    const image_url = req.body.image_url;
    const category = req.body.category;
    const location = req.body.location;
    const item_name = req.body.item_name;
    const price_per_day = req.body.price_per_day;
    const description = req.body.description;
    const start_date = req.body.start_date;
    const end_date = req.body.end_date;
    const item_id = uuidv4();
    const date_uploaded = new Date().toISOString();
    const current_renter = ''; // Assuming this is null when the item is first listed
    const isBooked = false;
    //need to add empty wishlist list here

     //check for missing fields
     if (!user_id || !image_url || !category || !item_name || !price_per_day || !description || !start_date || !end_date) {
        return res.status(400).json({
            message: 'Missing required fields'
        });
    }

    const params = {
        TableName: itemsTable,
        Item: {
            user_id: { S: user_id || '' },
            username: { S: username || '' },
            email: { S: email || '' },
            image_url: { S: image_url || '' },
            item_id: { S: item_id || '' },
            category: { S: category || '' },
            item_name: { S: item_name || '' },
            location: { S: location || '' },
            price_per_day: { S: price_per_day || '' },
            description: { S: description || '' },
            start_date: { S: start_date || '' },
            end_date: { S: end_date || '' },
            date_uploaded: { S: date_uploaded || '' },
            current_renter: { S: current_renter || '' },
            isBooked: { BOOL: isBooked || false }
        }
    };

    try {

        await ddbClient.send(new PutItemCommand(params));
        res.status(200).json({
            message: 'Item details added successfully'
        });
    } catch (error) {
        console.log("Error adding item details: ", error);
        res.status(500).json({
            message: 'Failed to add items',
            error: error.message
        });
    }
});

app.get('/getItems', async (req, res) => {
    const params = {
        TableName: itemsTable
    };
    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        console.log("Data from DynamoDB: ", data);
        if (!data.Items) {
            return res.status(404).json({ message: 'No items found' });
        }
        res.status(200).json(data.Items);
    } catch (error) {
        console.error('Error retrieving items:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/addReservation', async (req, res) => {
    const { itemowner_id, item_id, renter_id, reservation_start_date, reservation_end_date } = req.body;
    const booking_id = uuidv4();
    const date_created = new Date().toISOString();

    // Step 1: Add the reservation to the bookingTable
    const reservationParams = {
        TableName: bookingTable,
        Item: {
            itemowner_id: { S: itemowner_id || '' },
            renter_id: { S: renter_id || '' },
            item_id: { S: item_id || '' },
            reservation_start_date: { S: reservation_start_date || '' },
            reservation_end_date: { S: reservation_end_date || '' },
            booking_id: { S: booking_id },
            date_created: { S: date_created }
        }
    };

    // Step 2: Update the current_renter and isBooked fields in the itemsTable
    const updateItemParams = {
        TableName: itemsTable,
        Key: {
            item_id: { S: item_id }
        },
        UpdateExpression: "SET current_renter = :renter_id, isBooked = :isBooked",
        ExpressionAttributeValues: {
            ":renter_id": { S: renter_id },
            ":isBooked": { BOOL: true }
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        // Add the reservation to the bookingTable
        await ddbClient.send(new PutItemCommand(reservationParams));

        // Update the current_renter and isBooked fields in the itemsTable
        const updateResponse = await ddbClient.send(new UpdateItemCommand(updateItemParams));
        console.log("Updated current_renter and isBooked in itemsTable:", updateResponse);

        res.status(200).json({
            message: 'Reservation added successfully and current_renter updated',
            booking_id: booking_id
        });
    } catch (error) {
        console.error('Error adding reservation or updating current_renter:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/cancelReservation', async (req, res) => {
    const { item_id } = req.body;

    if (!item_id) {
        return res.status(400).json({ message: 'Missing required field: item_id' });
    }

    // Update the current_renter and isBooked fields in the itemsTable
    const updateItemParams = {
        TableName: itemsTable,
        Key: {
            item_id: { S: item_id }
        },
        UpdateExpression: "SET current_renter = :nullValue, isBooked = :isBooked",
        ExpressionAttributeValues: {
            ":nullValue": { NULL: true },
            ":isBooked": { BOOL: false }
        },
        ReturnValues: "UPDATED_NEW"
    };

    try {
        // Update the current_renter and isBooked fields in the itemsTable
        const updateResponse = await ddbClient.send(new UpdateItemCommand(updateItemParams));
        console.log("Updated current_renter to null and isBooked to false in itemsTable:", updateResponse);

        res.status(200).json({
            message: 'Reservation canceled successfully',
            updatedAttributes: updateResponse.Attributes
        });
    } catch (error) {
        console.error('Error canceling reservation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/removeListing', async (req, res) => {
    const { item_id } = req.body;
    const params = {
        TableName: itemsTable,
        Key: {
            item_id: { S: item_id }
        }
    };
    try {
        await ddbClient.send(new DeleteItemCommand(params));
        res.status(200).json({
            message: 'Item removed successfully'
        });
    } catch (error) {
        console.error('Error removing item:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
  









//////////////////////////////////////////////////////////////////
//SERVER ENDPOINTS
//////////////////////////////////////////////////////////////////
// app.post('/login', async (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;

//     if (!username || !password) {
//         console.log("Sending invalid login response1");
//         return res.status(401).json({ message: 'Username and Password are required' });
//     }

//     const params = {
//         TableName: usersTable,
//         Key: {
//             username: { S: username }
//         }
//     };

//     try {
//         const data = await ddbClient.send(new GetItemCommand(params));

//         if (!data.Item) {
//             // console.log("Sending invalid login response2");
//             res.status(500).json({ message: 'Invalid username or password' });
//         }

//         const hashedPassword = data.Item.password.S;
//         // console.log("Hashed password from DB: ", hashedPassword);
//         // console.log("User data from DB: ", data.Item);
//         // console.log("Password from request: ", password);
//         // console.log("Is valid password: ", isValidPassword);
//         const isValidPassword = compareSync(password.trim(), hashedPassword);

//         if (!isValidPassword) {
//             console.log("Sending invalid login response3");
//             res.status(500).json({ message: 'Invalid username or password' });
//         }

//         else {

//             const userInfo = {
//                 username: data.Item.username.S,
//                 email: data.Item.email.S,
//                 user_id: data.Item.user_id.S
//             };

//             const token = _generateToken(userInfo);
//             const response = {
//                 user: userInfo,
//                 token: token
//             };
//             console.log("Sending successful login response");
//             res.status(200).json(response);
//         }

//     } catch (error) {
//         console.error('Error retrieving user:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

app.post('/login', async (req, res) => {
    const username = req.body.username?.trim().toLowerCase();  // Clean up input
    const password = req.body.password;

    if (!username || !password) {
        console.log("Missing username or password");
        return res.status(401).json({ message: 'Username and Password are required' });
    }

    const params = {
        TableName: usersTable,
        Key: {
            username: { S: username }
        }
    };

    console.log("LOGIN PARAMS >>>", params); // Debug log

    try {
        const data = await ddbClient.send(new GetItemCommand(params));

        if (!data.Item) {
            console.log("User not found in DB");
            return res.status(500).json({ message: 'Invalid username or password' });
        }

        const hashedPassword = data.Item.password.S;
        const isValidPassword = compareSync(password.trim(), hashedPassword);

        if (!isValidPassword) {
            console.log("Password mismatch");
            return res.status(500).json({ message: 'Invalid username or password' });
        }

        const userInfo = {
            username: data.Item.username.S,
            email: data.Item.email.S,
            user_id: data.Item.user_id.S
        };

        const token = _generateToken(userInfo);
        const response = {
            user: userInfo,
            token: token
        };

        console.log("Successful login:", userInfo.username);
        res.status(200).json(response);

    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/register', async (req, res) => {
    console.log(req.body);
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        res.status(401).json({ message: 'Missing the required fields' });//checking for missing fields
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
                res.status(503).json({ message: 'Error saving user' });
            }
            res.status(200).json({ message: 'User registered successfully' });
        
        }

        if (data.Item && data.Item.username) {
            res.status(401).json({ message: 'User already exists!please choose a different username' });
        }
       

    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).json({ message: 'Error registering the user' });

    }

});

app.post('/createCommunityPost', async (req, res) => {
    const { user_id, username, message, contact_info } = req.body;

    if (!user_id || !username || !message || !contact_info) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const params = {
        TableName: 'Zwappr_Communities',
        Item: {
            post_id: { S: uuidv4() },
            user_id: { S: user_id },
            username: { S: username },
            message: { S: message },
            contact_info: { S: contact_info },
            timestamp: { S: new Date().toISOString() }
        }
    };

    try {
        await ddbClient.send(new PutItemCommand(params));
        res.status(200).json({ message: 'Post created successfully' });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: 'Failed to create post' });
    }
});

app.get('/getCommunityPosts', async (req, res) => {
    const params = { TableName: 'Zwappr_Communities' };
    try {
        const data = await ddbDocClient.send(new ScanCommand(params));
        res.status(200).json(data.Items);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
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
app.get('/aws-check', async (req, res) => {
    const { ListTablesCommand } = require("@aws-sdk/client-dynamodb");
    const listCommand = new ListTablesCommand({});
    const data = await ddbClient.send(listCommand);
    res.json({ tables: data.TableNames });
  });
  