const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store the values
let mq2 = 0.0;
let mq135 = 0.0;

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected');

    // Emit the current stored values when a client connects
    socket.emit('storedValues', { mq2, mq135 });

     // Listen for value changes
    socket.on('changeValues', (newValues) => {
        // Extract mq2 and mq135 values from the received object
        const { mq2: newMq2, mq135: newMq135 } = newValues;
        
        // Update stored values if received values are valid
        if (!isNaN(newMq2) && !isNaN(newMq135)) {
            mq2 = parseFloat(newMq2);
            mq135 = parseFloat(newMq135);
            // Broadcast the updated values to all connected clients
            io.emit('storedValues', { mq2, mq135 });
        } else {
            console.error('Invalid values received:', newValues);
        }
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


// API endpoint for fetching the stored values
app.get('/api/values', (req, res) => {
    res.json({ mq2, mq135 });
});

// API endpoint for changing the values
app.post('/api/values', express.json(), (req, res) => {
    const { mq2: newMq2, mq135: newMq135 } = req.body;
    // Update stored values if received values are valid
    if (!isNaN(newMq2) && !isNaN(newMq135)) {
        mq2 = newMq2;
        mq135 = newMq135;
        // Broadcast the updated values to all connected clients
        io.emit('storedValues', { mq2, mq135 });
        res.status(200).json({ message: 'Values updated successfully', mq2, mq135 });
    } else {
        res.status(400).json({ message: 'Invalid values received' });
    }
});


// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
