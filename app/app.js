// Import express.js
const express = require("express");
const { User } = require("./models/user");
const { Menu } = require("./models/menu");
const multer = require('multer');
const path = require('path');
// Create express app
var app = express();

// Add static files location
app.use(express.static("static"));
// Use the Pug templating engine
app.set('view engine', 'pug');
app.set('views', './app/views');

// Get the functions in the db.js file to use
const db = require('./services/db');


app.get('/hello', function (req, res) {
    res.render("index");
});

const cookieParser = require("cookie-parser");
const session = require('express-session');
app.use(cookieParser());
// app.get('/', async (req, res) => {
//     try {
//         const items = await db.getAllItems();
//         res.json(items);
//         res.render('dashboard',{"items":items})
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const oneDay = 1000 * 60 * 60 * 24;
const sessionMiddleware = session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false
});
app.use(sessionMiddleware);

app.get("/", function (req, res) {
    const sql = 'SELECT * FROM menu_item where category = "today_special" LIMIT 5';
    const sql1 = 'SELECT * FROM menu_item WHERE veg = "Yes" LIMIT 5';
    const sql2 = 'SELECT * FROM menu_item WHERE veg = "No" LIMIT 5';

    Promise.all([db.query(sql), db.query(sql1), db.query(sql2)])
        .then(([result, result1, result2]) => {
            res.render('dashboard', { items: result, items1: result1, items2: result2 });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});



app.get('/admin_login', function (req, res) {
    res.render('admin-login');
});

app.get('/create', function (req, res) {
    res.render('create-item');
});


app.get("/admin_dashboard", function (req, res) {
    const sql = 'SELECT * FROM menu_item';

    Promise.all([db.query(sql)])
        .then(([result]) => {
            res.render('admin-dashboard', {data: result});
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.get("/item_details/:itemId", async function (req, res) {
    const itemId = req.params.itemId;
    try {
        const menu = await Menu.getMenuItemById(itemId);
        res.render('admin-item-details', { data: menu });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', currentPage: 'home' });
    }
});

// app.get('/register', function (req, res) {
//     res.render('register');
// });

// Check submitted email and password pair
app.post('/authenticate', async function (req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send('Email and password are required.');
        }

        var user = new User(email);
        const uId = await user.getIdFromEmail();
        if (!uId) {
            return res.status(401).send('Invalid email');
        }

        const match = await user.authenticate(password);
        if (!match) {
            return res.status(401).send('Invalid password');
        }

        req.session.uid = uId;
        req.session.loggedIn = true;
        console.log(req.session.id);
        res.redirect('/admin_dashboard');
    } catch (err) {
        console.error(`Error while authenticating user:`, err.message);
        res.status(500).send('Internal Server Error');
    }
});



// app.post('/set-password', async function (req, res) {
//     params = req.body;
//     var user = new User(params.email);
//     try {
//         uId = await user.getIdFromEmail();
//         if (uId) {
//             // If a valid, existing user is found, set the password and redirect to the users single-student page
//             await user.setUserPassword(params.password);
//             console.log(req.session.id);
//             res.send('Password set successfully');
//         }
//         else {
//             // If no existing user is found, add a new one
//             newId = await user.addUser(params.email);
//             res.send('Perhaps a page where a new user sets a programme would be good here');
//         }
//     } catch (err) {
//         console.error(`Error while adding password `, err.message);
//     }
// });

app.get("/admin", function (req, res) {
    try {
        if (req.session.uid) {
            res.redirect('/');
        } else {
            res.render('admin-login');
        }
        res.end();
    } catch (err) {
        console.error("Error accessing root route:", err);
        res.status(500).send('Internal Server Error');
    }
});

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  // Initialize multer upload
  const upload = multer({
    storage: storage
  });

 
  

app.post('/create_item', upload.single('item_img'), async (req, res) => {
    try {
      const { name, category, veg, ingredients, benefits, calories, description } = req.body;
      const item_img = req.file ? req.file.path : '';
  
      // Insert the menu item into the database
      let sql = "INSERT INTO menu_item (name, category, veg, ingredients, benefits, calories, description, item_img) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
      await db.query(sql, [name, category, veg, ingredients, benefits, calories, description, item_img]);
  
      // Send a success response
      res.status(201).json({ message: 'Menu item created successfully' });
    } catch (error) {
      // If an error occurs, send an error response
      console.error('Error creating menu item:', error);
      res.status(500).json({ error: 'An error occurred while creating the menu item' });
    }
  });
  


app.get('/logout', function (req, res) {
    try {
        req.session.destroy();
        res.redirect('/login');
    } catch (err) {
        console.error("Error logging out:", err);
        res.status(500).send('Internal Server Error');
    }
});

// Start server on port 3000
app.listen(3000, function () {
    console.log(`Server running at http://127.0.0.1:3000/`);
});