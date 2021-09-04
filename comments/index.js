const express =  require('express');
const { randomBytes} = require('crypto'); // use this to create random ids for comments that are created
const cors = require('cors');
const axios = require('axios');


// create an express application
const app = express();
app.use(express.json()); // use express.json() json parset instead of body-parser which is deprecated
app.use(cors()); // use cors() to avoid cross site scripting errors


// this object will hold all of the comments by post id
const commentsByPostId = {};



// develop our 2 route handlers to handle get and post requests

// the get request
app.get('/posts/:id/comments', (request, response) => {
    // send array of comments back for the given post id; if the comments array is 
    // undefined, send back an empty array
    response.send(commentsByPostId[request.params.id] || []);
});

// the post request
app.post('/posts/:id/comments', async(request, response) => {
// create a new comment; we are going to store all of our comments in an in-memory data structure

    // first generate a new random comment id and convert it to a hexadecimal string
    const commentId = randomBytes(4).toString('hex');

    // next pull out the content from the request body
    const { content } = request.body;
   
    // next check our commentsByPostId object to see if we already have an array for the commentId
    // this will either give us an array or undefined.  If undefined, then set comments to an empty array.
    const comments = commentsByPostId[request.params.id] || []; 

    // then push the current id and request body content onto the comments array
    comments.push({ id: commentId, content, status: 'Pending' });

    // reassign this comments array back to the given post inside our commentsByPostId object
    commentsByPostId[request.params.id] = comments;

 
    // make axios post request to port 4005 where the event-bus broker is running
    await axios.post('http://localhost:4005/events', {
        // comment data is going to consist of 3 elements:
        //     1) a comment id
        //     2) comment content
        //     3) post id that owns this comment
        //     4) status of Pending initially
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: request.params.id,
            status: 'Pending'
        }

    }).catch((err) => {
        console.log(err.message);
    });
 
    // finally send back the entire array of comments along with a status code of 201 indicating a resource
    response.status(201).send(comments);

});

// add a post request handler even though the comment service doesn't care about
// any events that are sent/emitted by the event-bus broker, so just console.log
// the event
app.post('/events', async(request, response) => {
    console.log('Comments Received Event: ', request.body.type);

    const {type,data} = request.body;

    if (type ==='CommentModerated'){
        const {postId, id, status, content} = data;

        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => {
            return comment.id === id;
        });
        comment.status = status;

        // emit a CommentUpdated event to the Event-Bus
        await axios.post('http://localhost:4005/events',{
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        }).catch((err) => {
            console.log(err.message);
        });
    }    

    // respond to the event that was received by sending back an empty object to
    // indicate that everything is good.
    response.send({});
});


/*
app.post('/events', async (request, response) => {
    console.log('Comments Received Event: ', request.body.type);

    const {type,data} = request.body;

    if (type ==='CommentModerated'){
        const {postId, id, status, content} = data;

        const comments = commentsByPostId[postId];
        const comment = comments.find(comment => {
            return comment.id === id;
        });
        comment.status = status;

        await axios.post('http://localhost:4005',{
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        });
    }

    // respond to the event that was received by sending back an empty object to
    // indicate that everything is good.
    response.send({});
});
*/

// finally make sure this Express application listens on some port -- 4001
app.listen(4001, () => {
    console.log('Comments Service: Listening on port 4001')
});