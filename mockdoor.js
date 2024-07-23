const express = require('express');

const app = express();

app.get('/open', (req, res) => {
    //return json response
    res.json({ message: 'Error' });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});