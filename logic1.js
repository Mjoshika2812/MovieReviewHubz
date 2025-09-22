// Add your OMDB API key here
const API_KEY = 'd3d17cf1';

// DOM Elements
const searchInput = document.getElementById('movie-search');
const searchBtn = document.getElementById('search-btn');
const movieInfoDiv = document.getElementById('movie-info');
const initialMessage = document.getElementById('initial-message');
const movieTitle = document.getElementById('movie-title');
const moviePoster = document.getElementById('movie-poster');
const moviePlot = document.getElementById('movie-plot');
const movieGenre = document.getElementById('movie-genre');
const movieYear = document.getElementById('movie-year');
const movieRating = document.getElementById('movie-rating');
const reviewText = document.getElementById('review-text');
const userRatingSelect = document.getElementById('user-rating');
const reviewsList = document.getElementById('reviews-list');
const themeSwitch = document.getElementById('checkbox');
const suggestionsList = document.getElementById('suggestions-list');
const viewReviewsBtn = document.getElementById('view-reviews-btn');
const reviewedMoviesSection = document.getElementById('reviewed-movies-section');
const reviewedMoviesList = document.getElementById('reviewed-movies-list');
const reviewForm = document.getElementById('review-form');


const carouselContainer = document.querySelector('.carousel-container');
const carouselSlides = document.querySelectorAll('.carousel-slide');
let currentSlide = 0;


async function fetchMovie(title) {
    const url = `https://www.omdbapi.com/?t=${title}&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching movie data:', error);
        return null;
    }
}


async function searchMovies(query) {
    const url = `https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.Search;
    } catch (error) {
        console.error('Error fetching search results:', error);
        return null;
    }
}

function saveReviewedMovie(movie) {
    const reviewedMovies = JSON.parse(localStorage.getItem('reviewedMovies')) || {};
    reviewedMovies[movie.imdbID] = {
        title: movie.Title,
        poster: movie.Poster,
        imdbID: movie.imdbID
    };
    localStorage.setItem('reviewedMovies', JSON.stringify(reviewedMovies));
}


function saveReview(movieId, review) {
    const reviews = JSON.parse(localStorage.getItem(movieId)) || [];
    reviews.push(review);
    localStorage.setItem(movieId, JSON.stringify(reviews));
}


function setTheme(theme) {
    if (theme === 'light-theme') {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        themeSwitch.checked = true;
    } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        themeSwitch.checked = false;
    }
}


function switchTheme(e) {
    if (e.target.checked) {
        setTheme('light-theme');
        localStorage.setItem('theme', 'light-theme');
    } else {
        setTheme('dark-theme');
        localStorage.setItem('theme', 'dark-theme');
    }
}


window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('dark-theme');
    }
});


function displayMovie(movie) {
    initialMessage.classList.add('hidden');
    reviewedMoviesSection.classList.add('hidden');
    movieInfoDiv.classList.add('hidden');
    
    if (movie && movie.Response === "True") {
        movieInfoDiv.classList.remove('hidden');
        
        movieTitle.textContent = movie.Title;
        moviePoster.src = movie.Poster !== "N/A" ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Poster';
        moviePlot.textContent = movie.Plot;
        movieGenre.textContent = movie.Genre;
        movieYear.textContent = movie.Year;
        movieRating.textContent = movie.imdbRating !== "N/A" ? movie.imdbRating : 'Not available';

        movieInfoDiv.dataset.movieId = movie.imdbID;
        loadReviews(movie.imdbID);
    } else {
        initialMessage.classList.remove('hidden');
        initialMessage.innerHTML = '<h2>Movie not found! Please try a different title.</h2>';
    }
}


function displaySuggestions(movies) {
    suggestionsList.innerHTML = '';
    
    if (movies && movies.length > 0) {
        movies.forEach(movie => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/50x75?text=No+Image'}" alt="${movie.Title} Poster">
                <div>
                    <strong>${movie.Title}</strong>
                    <span>(${movie.Year})</span>
                </div>
            `;
            li.addEventListener('click', async () => {
                searchInput.value = movie.Title;
                suggestionsList.classList.remove('visible'); 
                
                const movieData = await fetchMovie(movie.Title);
                displayMovie(movieData);

                searchInput.value = '';
            });
            suggestionsList.appendChild(li);
        });
        suggestionsList.classList.add('visible');
    } else {
        suggestionsList.classList.remove('visible');
    }
}


function loadReviews(movieId) {
    const reviews = JSON.parse(localStorage.getItem(movieId)) || [];
    reviewsList.innerHTML = '';
    if (reviews.length > 0) {
        reviews.forEach(review => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>Rating: ${review.rating} / 5</strong><p>${review.text}</p>`;
            reviewsList.appendChild(li);
        });
    } else {
        reviewsList.innerHTML = '<li>No reviews yet. Be the first!</li>';
    }
}

async function loadReviewedMovies() {
    initialMessage.classList.add('hidden');
    movieInfoDiv.classList.add('hidden');
    reviewedMoviesSection.classList.remove('hidden');

    const reviewedMovies = JSON.parse(localStorage.getItem('reviewedMovies')) || {};
    const movieArray = Object.values(reviewedMovies);
    
    reviewedMoviesList.innerHTML = '';

    if (movieArray.length > 0) {
        movieArray.forEach(movie => {
            const li = document.createElement('li');
            li.innerHTML = `
                <img src="${movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/200x300?text=No+Poster'}" alt="${movie.title} Poster">
                <div class="movie-title-reviewed">${movie.title}</div>
            `;
            li.dataset.imdbId = movie.imdbID;
            li.addEventListener('click', async () => {
                const movieData = await fetchMovie(movie.title);
                displayMovie(movieData);
            });
            reviewedMoviesList.appendChild(li);
        });
    } else {
        reviewedMoviesList.innerHTML = '<li>You have not reviewed any movies yet.</li>';
    }
}

function moveCarousel() {
    currentSlide++;
    if (currentSlide === carouselSlides.length) {
        currentSlide = 0;
    }
    carouselContainer.style.transform = `translateX(-${currentSlide * 25}%)`;
}


themeSwitch.addEventListener('change', switchTheme);


searchBtn.addEventListener('click', async () => {
    const title = searchInput.value.trim();
    if (title) {
        suggestionsList.classList.remove('visible');
        
        initialMessage.classList.add('hidden');
        movieInfoDiv.classList.add('hidden');
        reviewedMoviesSection.classList.add('hidden');
        initialMessage.innerHTML = '<h2>Searching...</h2>';
        initialMessage.classList.remove('hidden');

        const movieData = await fetchMovie(title);
        displayMovie(movieData);
        
        searchInput.value = '';
        
    } else {
        initialMessage.classList.remove('hidden');
        initialMessage.innerHTML = '<h2>Please enter a movie title.</h2>';
    }
});


searchInput.addEventListener('input', async () => {
    const query = searchInput.value.trim();
    if (query.length >= 3) {
        const searchResults = await searchMovies(query);
        displaySuggestions(searchResults);
    } else {
        suggestionsList.classList.remove('visible');
    }
});


document.addEventListener('click', (event) => {
    if (!event.target.closest('.search-container')) {
        suggestionsList.classList.remove('visible');
    }
});


reviewForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const movieId = movieInfoDiv.dataset.movieId;
    const userRating = userRatingInput.value; 
    const userReview = reviewText.value.trim();

    if (userReview && movieId && userRating) {
        const newReview = {
            rating: userRating,
            text: userReview,
            timestamp: new Date().toISOString()
        };
        saveReview(movieId, newReview);
        loadReviews(movieId);

        const movieDetails = {
            imdbID: movieId,
            Title: movieTitle.textContent,
            Poster: moviePoster.src
        };
        saveReviewedMovie(movieDetails);

        reviewText.value = '';
        userRatingInput.value = ''; 
 
        stars.forEach(s => {
            s.classList.remove('fas');
            s.classList.add('far');
        });
    } else {
        alert('Please provide a rating and a review.');
    }
});


const stars = document.querySelectorAll('#star-rating i');
const userRatingInput = document.getElementById('user-rating-input');


stars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = star.getAttribute('data-value');
        userRatingInput.value = rating;

        stars.forEach(s => {
            s.classList.remove('fas');
            s.classList.add('far');
        });

        for (let i = 0; i < rating; i++) {
            stars[i].classList.remove('far');
            stars[i].classList.add('fas');
        }
    });

    star.addEventListener('mouseover', () => {
        const rating = star.getAttribute('data-value');
        for (let i = 0; i < rating; i++) {
            stars[i].classList.remove('far');
            stars[i].classList.add('fas');
        }
    });

    star.addEventListener('mouseout', () => {
        const currentRating = userRatingInput.value;
        if (!currentRating) {
            stars.forEach(s => {
                s.classList.remove('fas');
                s.classList.add('far');
            });
        }
    });
});


viewReviewsBtn.addEventListener('click', () => {
    loadReviewedMovies();
});



setInterval(moveCarousel, 5000);
