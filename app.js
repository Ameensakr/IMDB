const express = require('express');

const mongoos = require('mongoose');

const app = express();


const uri = 'mongodb+srv://Ameen:WKWh4dux4xotZGrg@imdb.hn3af24.mongodb.net/?retryWrites=true&w=majority&appName=imdb';


mongoos.connect(uri)
.then((result) => {
    app.listen(3000);
    console.log('MongoDB connected successfully!');
})
.catch((err) => {
    console.error('MongoDB connection error:');
    console.error(err.message);
    console.error('Full error:', err);
});




app.set('view engine' , 'ejs');
app.use(express.static('public'));

app.get('/' , (req , res) =>{
    res.render('index');
});
app.get('/signup' , (req , res) =>{
    res.render('signup');
});
app.get('/welcome' , (req , res) =>{
    res.render('welcome');
});

app.use((req , res) => {
    res.status(404).render('404');
})