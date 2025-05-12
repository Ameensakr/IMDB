const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();

// Import controllers
const userController = require('./controllers/userController');
const filmController = require('./controllers/filmController');

// MongoDB connection
const uri = 'mongodb+srv://Ameen:WKWh4dux4xotZGrg@imdb.hn3af24.mongodb.net/?retryWrites=true&w=majority&appName=imdb';

mongoose.connect(uri)
    .then((result) => {
        if (process.env.NODE_ENV !== 'test')
        {
            app.listen(3000);
            console.log('MongoDB connected successfully!');
        }
        
    })
    .catch((err) => {
        console.error('MongoDB connection error:');
        console.error(err.message);
        console.error('Full error:', err);
    });

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // set to true if using https
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Add this middleware function after your session setup
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next(); // User is logged in, continue
  } else {
    res.redirect('/'); // Not logged in, redirect to login
  }
};

const checkLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    // console.log('ana hena');
    return res.redirect('/welcome'); // Already logged in, redirect to welcome
  } else {
    next(); // Not logged in, proceed to login page
  }
};

// Routes
app.get('/', checkLoggedIn, (req, res) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.render('index', { user: req.session.user || null });
});

// User routes
app.get('/signup', checkLoggedIn, (req, res) => {
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.render('signup', { user: req.session.user || null });
});

app.post('/signup', userController.signup);
app.post('/login', userController.login);
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Film routes
app.get('/welcome', requireAuth, filmController.getAllFilms);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

module.exports = app;