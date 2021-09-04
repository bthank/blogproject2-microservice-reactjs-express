const express = require('express');
// body parser is deprecated and won't be used
const cors = require('cors');

const app = express();
app.use(express.json()); // this is middleware for parsing the body of Json requests
app.use(cors());  // this is middleware to handle cross site scripting


// use an object data structure to store all posts
//
// QUICK EXAMPLE of the data structure
//    posts === {
//       'j3j23d1': {
//          id: 'j3j23d1',
//          title: 'post title',
//          comments: [
//            { id: '72sd32', content: 'Test comment' }
//          ]
//       },
//    },
//       'k3j23d2': {
//          id: 'k3j23d2',
//          title: 'post title',
//          comments: [
//            { id: '52sa32', content: 'Test comment' }
//          ]
//       },
//    },
//
// this query service needs to ensure that as it receives requests, it places
// them in the object using the above data structure

const posts = {};

// route handler for get requests to /posts
app.get('/posts', (request, response) => {
    // send back the entire posts object array whenever someone hits this url
    response.send(posts);
});


// route handler for post requests to /events
app.post('/events',(request, response) => {

    // destructure request.body into a type and data properties
    const { type, data } = request.body;

    if (type === 'PostCreated'){
        // destructure data into id and title properties
        const { id, title } = data;

        // insert that info into our posts object while defaulting comments to an empty array
        posts[id] = { id, title, comments: [] };

    }    

    if (type === 'CommentCreated') {
        // destructure data into an id, content and post Id
        const { id, content, postId, status} = data;

        // set post to the post that we find in the posts object array for that postId
        const post = posts[postId];
        // push in this new comment to post.comment
        post.comments.push({ id, content, status});
    } 


    /*

    if (type === 'CommentUpdated') {
        const { id, content, postId, status } = data;

        const post = posts[postId];
        const comment = post.comments.find(comment => {
            return comment.id === id;
        });

        comment.status = status;
        comment.content = content;
        
    }
*/
    // print out the posts data structure
    console.log(posts);

    // finally send back a response to the route
    response.send({}); // send back an empty object to indicate event was received and processed


});

// have this query service listen on port 4002
app.listen(4002, () => {
    console.log('Query Service: Listening on port 4002')
});

