const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.listen(8000, () => {
    console.log('Server running on port 8000');
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello"
    });
});
