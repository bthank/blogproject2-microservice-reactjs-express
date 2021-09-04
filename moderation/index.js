const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// this route handler watches for events of type comment created
app.post('/events', async (request, response) => {
  
    // receive event from broker and destructure it into type and data
    const {type,data} = request.body;

    if (type === 'CommentCreated') {
        const status = data.content.includes('orange') ? 'rejected' : 'approved';
        // send the event to the Event-Bus at port 4005
        await axios.post('http://localhost:4005/events', {
            type: 'CommentModerated',
            data: {
                id: data.id,
                postId: data.postId,
                status,
                content: data.content
            }
        }).catch((err) => {
            console.log(err.message);
        })  ;
    }

    response.send({});
 
});

app.listen(4003, () => {
    console.log('Moderation Service: Listening on port 4003');
});