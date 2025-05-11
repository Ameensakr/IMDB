const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const app = express();

// Import controllers
const userController = require('./controllers/userController');
const filmController = require('./controllers/filmController');

// MongoDB connection
const uri = 'mongodb+srv://samehmostafa625:PX40KeAYz4cOzlum@imdb.lyakcv9.mongodb.net/?retryWrites=true&w=majority&appName=imdb';

mongoose.connect(uri)
    .then((result) => {
        app.listen(3001);
        console.log('MongoDB connected successfully!');
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

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// User routes
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', userController.signup);
app.post('/login', userController.login);
app.get('/logout', userController.logout);

// Film routes
app.get('/welcome', filmController.getAllFilms);
app.get('/films/:id', filmController.getFilmById);
app.post('/films', filmController.createFilm);
app.put('/films/:id', filmController.updateFilm);
app.delete('/films/:id', filmController.deleteFilm);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});