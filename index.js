const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store the value
let storedValue = 0.0;

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('Client connected');

    // Emit the current stored value when a client connects
    socket.emit('storedValue', storedValue);

     // Listen for value changes
     socket.on('changeValue', (newValue) => {
        // Convert the received value to a double
        const parsedValue = parseFloat(newValue);
        if (!isNaN(parsedValue)) {  
            storedValue = parseFloat(parsedValue);
            // Broadcast the updated value to all connected clients
            io.emit('storedValue', storedValue);
        } else {
            console.error('Invalid value received:', newValue);
        }
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


// API endpoint for fetching the stored value
app.get('/api/value', (req, res) => {
    res.json({ value: storedValue });
});

// API endpoint for changing the value
app.post('/api/value', express.json(), (req, res) => {
    const newValue = req.body.value;
    storedValue = newValue;
    // Broadcast the updated value to all connected clients
    io.emit('storedValue', storedValue);
    res.status(200).json({ message: 'Value updated successfully', newValue });
});


// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
