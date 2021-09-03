const express = require('express');
// bodyParser is necessary so that we ensure that whenever a user sends us some JSON data in
// in the body of a request it gets parsed and shows up appropriately in our
// request handler  
//var bodyParser = require('body-parser'); 
// body-parser was deprecated and will not be used; instead we will use express'
// built-in json() method to parse the JSON in the request
const { randomBytes } = require('crypto'); // this will generate a random id for posts that the user creates
const cors = require('cors');
const axios = require('axios'); // needed for making ajax requests

// create an express app to be able to use express middleware to process http requests
const app = express();
// use express.json() instead of body-parser which has been deprecated
app.use(express.json());
// use cors() to avoid cross side scripting errors 
app.use(cors());



// the posts object will be where we store every post that we create
// posts object is a repository for every object that was created
const posts = {};

// if anyone makes a get request to /posts, we will send back all of the posts that have been created
app.get('/posts', (request, response) => {
    // send all of our posts
    response.send(posts);
});


// post endpoint to create a new post using the request body the user sent to us
app.post('/posts', async (request, response) => {
    const id = randomBytes(4).toString('hex'); // the id will look like kk544k4k44j223j23k3j
// get access to the title in the body that the user just sent to us in the request
    const { title } = request.body;

    // associate the id with the title fro the user's request
    posts[id] = {
        id, title
    };

    // use axios to make a post request to port 4005 which is where our event-bus broker is running 
    await axios.post('http://localhost:4005/events', {  // 2nd arg is the event we want to send over
        // each event will have a type and a data property which will be the post that was created.
        // The data property will consist of an id and title.
         type: 'PostCreated',
         data: {
              id, title
         }
     }).catch((err) => {
        console.log(err.message);
    });


    // send back a status of 201 which indicates we created a resource to the user to indicate that all is good
    // also send back the post that was just created
    response.status(201).send(posts[id]);
});


// add a post request handler even though the post service doesn't care about
// any events that are sent/emitted by the event-bus broker, so just console.log
// the event
app.post('/events',(request, response) => {
    console.log('Posts Received Event: ', request.body.type);

    // then respond to the event that was received with an empty object to indicate
    // that we received the event and everything is good.
    response.send({});
});

// have this posts service listen on port 4000
app.listen(4000, () => {
    console.log('Posts Service: Listening on port 4000');
});



