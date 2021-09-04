const express = require('express');
// body-parser is deprecated and will not be used
const axios = require('axios');

const app = express();
app.use(express.json()); // in order to parse JSON requests

// set up a post request handler on /events, with a callback function where event is
// set to the request body.
app.post('/events', (request, response) => {
    const event = request.body;

    // now that we have our event, we need to create a series of post requests to
    // all of our other running services and the data that we are going to send along 
    // is that same event
    axios.post('http://localhost:4000/events', event).catch((err) => {
        console.log(err.message); // is posts
    });
    axios.post('http://localhost:4001/events', event).catch((err) => {
        console.log(err.message); // is comments
    });
    axios.post('http://localhost:4002/events', event).catch((err) => {
        console.log(err.message); // is the query service
    });
    axios.post('http://localhost:4003/events', event).catch((err) => {
        console.log(err.message); // is the comment moderation service
    });
    response.send({ status: 'OK' }); // send this back to indicate all went as expected
});

// we will have our even bus listen for events on port 4005
app.listen(4005, () => {
    console.log('Event-Bus Service: Listening on port 4005');
});