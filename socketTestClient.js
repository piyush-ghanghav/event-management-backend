const io = require('socket.io-client');

const socket = io('http://localhost:5000');

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('new-event', (event) => { 
    console.log('New event:', event);
});

socket.on('update-attendees', (data) => {
    console.log('Updated attendees for event ID:', data.eventID, 'with attendees:', data.attendees);
});


socket.on('disconnect', () => {
    console.log('Disconnected from server');
})