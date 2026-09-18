const API_KEY = "14855db8692ee7878ca18ab74408e5c3";
const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

const trendingContainer = document.getElementById("trendingMovies");
const popularContainer = document.getElementById("popularMovies");
const searchContainer = document.getElementById("searchResults");
const searchSection = document.getElementById("searchResultsSection");
const searchInput = document.getElementById("searchInput");

async function loadTrending() {
  trendingContainer.innerHTML = '<div class="loading">Loading movies...</div>';
  try {
    const response = await fetch(`${API_URL}/trending/movie/week?api_key=${API_KEY}`);
    const data = await response.json();
    if (data.success === false) throw new Error(data.status_message);
    displayMovies(data.results, trendingContainer);
  } catch (error) {
    trendingContainer.innerHTML = '<div class="loading">Unable to load movies. Check your TMDB API key.</div>';
    console.error(error);
  }
}

async function loadPopular() {
  popularContainer.innerHTML = '<div class="loading">Loading movies...</div>';
  try {
    const response = await fetch(`${API_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`);
    const data = await response.json();
    if (data.success === false) throw new Error(data.status_message);
    displayMovies(data.results, popularContainer);
  } catch (error) {
    popularContainer.innerHTML = '<div class="loading">Unable to load movies.</div>';
    console.error(error);
  }
}

function displayMovies(movies, container) {
  if (!movies || movies.length === 0) {
    container.innerHTML = '<div class="loading">No movies found.</div>';
    return;
  }

  container.innerHTML = movies.map(movie => {
    const poster = movie.poster_path
      ? IMAGE_URL + movie.poster_path
      : "https://via.placeholder.com/500x750?text=No+Poster";

    const title = movie.title || "Unknown Movie";
    const year = movie.release_date ? movie.release_date.substring(0,4) : "N/A";
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";

    return `
      <div class="movie-card" data-movie-id="${movie.id}">
        <img src="${poster}" alt="${escapeHTML(title)}" loading="lazy">
        <div class="movie-info">
          <h3>${escapeHTML(title)}</h3>
          <p class="rating">⭐ ${rating}</p>
          <p>${year}</p>
        </div>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".movie-card").forEach(card => {
    const movie = movies.find(m => String(m.id) === card.dataset.movieId);
    card.addEventListener("click", () => openMovie(movie));
  });
}

let searchTimeout;

function searchMovies() {
  clearTimeout(searchTimeout);
  const query = searchInput.value.trim();

  if (!query) {
    searchSection.classList.add("hidden");
    return;
  }

  searchTimeout = setTimeout(() => performSearch(query), 400);
}

async function performSearch(query) {
  searchSection.classList.remove("hidden");
  searchContainer.innerHTML = '<div class="loading">Searching...</div>';

  try {
    const response = await fetch(
      `${API_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );
    const data = await response.json();
    if (data.success === false) throw new Error(data.status_message);

    displayMovies(data.results, searchContainer);
    searchSection.scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    searchContainer.innerHTML = '<div class="loading">Search failed.</div>';
    console.error(error);
  }
}

function openMovie(movie) {
  const modal = document.getElementById("movieModal");

  document.getElementById("modalTitle").textContent = movie.title || "Unknown";
  document.getElementById("modalOverview").textContent =
    movie.overview || "No description available.";

  document.getElementById("modalRating").textContent =
    `⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}`;

  document.getElementById("modalDate").textContent =
    movie.release_date || "Release date N/A";

  document.getElementById("modalGenre").textContent = "Movie";

  document.getElementById("modalPoster").src =
    movie.poster_path
      ? IMAGE_URL + movie.poster_path
      : "https://via.placeholder.com/500x750?text=No+Poster";

  document.getElementById("trailerButton").href =
    `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("movieModal").classList.add("hidden");
  document.body.style.overflow = "auto";
}

document.getElementById("movieModal").addEventListener("click", function(event) {
  if (event.target === this) closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

function toggleMenu() {
  document.querySelector("nav").classList.toggle("active");
}

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

loadTrending();
loadPopular();
