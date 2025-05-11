const Film = require('../models/film');
const User = require('../models/user');

// Initialize films in the database
const initializeFilms = async () => {
    try {
        const films = [
            {
                title: "The Shawshank Redemption",
                description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
                releaseYear: 1994,
                genre: ["Drama"],
                director: "Frank Darabont",
                cast: ["Tim Robbins", "Morgan Freeman"],
                rating: 9.3,
                duration: 142,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg"
            },
            {
                title: "The Godfather",
                description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
                releaseYear: 1972,
                genre: ["Crime", "Drama"],
                director: "Francis Ford Coppola",
                cast: ["Marlon Brando", "Al Pacino", "James Caan"],
                rating: 9.2,
                duration: 175,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg"
            },
            {
                title: "The Dark Knight",
                description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                releaseYear: 2008,
                genre: ["Action", "Crime", "Drama"],
                director: "Christopher Nolan",
                cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
                rating: 9.0,
                duration: 152,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg"
            },
            {
                title: "Forrest Gump",
                description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
                releaseYear: 1994,
                genre: ["Drama", "Romance"],
                director: "Robert Zemeckis",
                cast: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
                rating: 8.8,
                duration: 142,
                posterUrl: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg"
            }
        ];

        // Check if films already exist
        const existingFilms = await Film.find();
        if (existingFilms.length === 0) {
            await Film.insertMany(films);
        }
    } catch (error) {
        res.status(500).json({ error: 'Error initializing films' });
    }
};

// Call initializeFilms when the server starts
initializeFilms();

// Get all films
const getAllFilms = async (req, res) => {
    try {
        const films = await Film.find().sort({ rating: -1 });
        // Get user information from session or request
        const user = req.session.user || null;
        res.render('welcome', { films, user });
    } catch (error) {
        console.error('Error fetching films:', error);
        res.status(500).render('welcome', { error: 'Error fetching films' });
    }
};

// Get film by ID
const getFilmById = async (req, res) => {
    try {
        const film = await Film.findById(req.params.id);
        if (!film) {
            return res.status(404).render('404');
        }
        res.render('film-details', { film });
    } catch (error) {
        console.error('Error fetching film:', error);
        res.status(500).render('404');
    }
};

// Create new film
const createFilm = async (req, res) => {
    try {
        const film = new Film(req.body);
        await film.save();
        res.status(201).json(film);
    } catch (error) {
        console.error('Error creating film:', error);
        res.status(500).json({ error: 'Error creating film' });
    }
};

// Update film
const updateFilm = async (req, res) => {
    try {
        const film = await Film.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        res.json(film);
    } catch (error) {
        console.error('Error updating film:', error);
        res.status(500).json({ error: 'Error updating film' });
    }
};

// Delete film
const deleteFilm = async (req, res) => {
    try {
        const film = await Film.findByIdAndDelete(req.params.id);
        if (!film) {
            return res.status(404).json({ error: 'Film not found' });
        }
        res.json({ message: 'Film deleted successfully' });
    } catch (error) {
        console.error('Error deleting film:', error);
        res.status(500).json({ error: 'Error deleting film' });
    }
};

module.exports = {
    getAllFilms,
    getFilmById,
    createFilm,
    updateFilm,
    deleteFilm
}; 