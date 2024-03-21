// Import express.js
const express = require("express");

// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));
// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');


// app.get('/', function (req, res) {
//     res.send("hello world");
// });


// app.get('/', async (req, res) => {
//     try {
//         const items = await db.getAllItems();
//         res.json(items);
//         res.render('dashboard',{"items":items})
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });



app.get("/", function (req, res) {
    const sql = 'SELECT * FROM menu_item where category = "today_special" LIMIT 5';
    const sql1 = 'SELECT * FROM menu_item WHERE veg = "Yes" LIMIT 5';
    const sql2 = 'SELECT * FROM menu_item WHERE veg = "No" LIMIT 5';

    Promise.all([db.query(sql), db.query(sql1),db.query(sql2)])
        .then(([result, result1,result2]) => {
            res.render('dashboard', { items: result , items1: result1 , items2: result2 });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Get item by ID
app.get('/api/items/:id', async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await db.getItemById(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Start server on port 3000
app.listen(3000,function(){
    console.log(`Server running at http://127.0.0.1:3000/`);
});