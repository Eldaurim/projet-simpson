const API_BASE_URL = 'https://thesimpsonsapi.com/api';
const CDN_BASE_URL = 'https://cdn.thesimpsonsapi.com';

// État de l'application
const state = {
    characters: {
        page: 1,
        loading: false,
        hasMore: true,
        data: []
    },
    episodes: {
        page: 1,
        loading: false,
        hasMore: true,
        data: []
    },
    locations: {
        page: 1,
        loading: false,
        hasMore: true,
        data: []
    },
    currentTab: 'characters'
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    loadCharacters();
    setupInfiniteScroll();
});

// Configuration des onglets
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

// Changement d'onglet
function switchTab(tabName) {
    state.currentTab = tabName;
    
    // Mise à jour des boutons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Mise à jour du contenu
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // Charger les données si nécessaire
    if (state[tabName].data.length === 0) {
        if (tabName === 'characters') loadCharacters();
        if (tabName === 'episodes') loadEpisodes();
        if (tabName === 'locations') loadLocations();
    } else {
        // Ré-afficher les données déjà chargées
        const grid = document.getElementById(`${tabName}-grid`);
        grid.innerHTML = ''; // Vider la grille pour éviter les doublons
        
        if (tabName === 'characters') renderCharacters(state.characters.data);
        if (tabName === 'episodes') renderEpisodes(state.episodes.data);
        if (tabName === 'locations') renderLocations(state.locations.data);
    }
}

// Scroll infini
function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            const currentState = state[state.currentTab];
            
            if (!currentState.loading && currentState.hasMore) {
                if (state.currentTab === 'characters') loadCharacters();
                if (state.currentTab === 'episodes') loadEpisodes();
                if (state.currentTab === 'locations') loadLocations();
            }
        }
    });
}

// Chargement des personnages
async function loadCharacters() {
    if (state.characters.loading || !state.characters.hasMore) return;
    
    state.characters.loading = true;
    showLoader('characters');
    
    try {
        const response = await fetch(`${API_BASE_URL}/characters?page=${state.characters.page}`);
        const data = await response.json();
        
        // L'API retourne un objet avec results
        const characters = data.results || [];
        
        if (characters.length === 0) {
            state.characters.hasMore = false;
        } else {
            state.characters.data.push(...characters);
            state.characters.page++;
            renderCharacters(characters);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des personnages:', error);
        showError('characters', 'Impossible de charger les personnages');
    } finally {
        state.characters.loading = false;
        hideLoader('characters');
    }
}

// Chargement des épisodes
async function loadEpisodes() {
    if (state.episodes.loading || !state.episodes.hasMore) return;
    
    state.episodes.loading = true;
    showLoader('episodes');
    
    try {
        const response = await fetch(`${API_BASE_URL}/episodes?page=${state.episodes.page}`);
        const data = await response.json();
        
        // L'API retourne un objet avec results
        const episodes = data.results || [];
        
        if (episodes.length === 0) {
            state.episodes.hasMore = false;
        } else {
            state.episodes.data.push(...episodes);
            state.episodes.page++;
            renderEpisodes(episodes);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des épisodes:', error);
        showError('episodes', 'Impossible de charger les épisodes');
    } finally {
        state.episodes.loading = false;
        hideLoader('episodes');
    }
}

// Chargement des lieux
async function loadLocations() {
    if (state.locations.loading || !state.locations.hasMore) return;
    
    state.locations.loading = true;
    showLoader('locations');
    
    try {
        const response = await fetch(`${API_BASE_URL}/locations?page=${state.locations.page}`);
        const data = await response.json();
        
        // L'API retourne un objet avec results
        const locations = data.results || [];
        
        if (locations.length === 0) {
            state.locations.hasMore = false;
        } else {
            state.locations.data.push(...locations);
            state.locations.page++;
            renderLocations(locations);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des lieux:', error);
        showError('locations', 'Impossible de charger les lieux');
    } finally {
        state.locations.loading = false;
        hideLoader('locations');
    }
}

// Rendu des personnages
function renderCharacters(characters) {
    const grid = document.getElementById('characters-grid');
    
    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Utiliser le CDN avec la taille 500px pour les cartes
        const imagePath = character.portrait_path ? `${CDN_BASE_URL}/500${character.portrait_path}` : '';
        const phrases = character.phrases || [];
        const displayPhrases = phrases.slice(0, 3);
        
        card.innerHTML = `
            ${imagePath ? `<img src="${imagePath}" alt="${character.name}" class="card-image" onerror="this.style.display='none'">` : ''}
            <div class="card-header">
                <h3>${character.name}</h3>
                ${character.status ? `<span class="status-badge ${character.status.toLowerCase()}">${character.status}</span>` : ''}
            </div>
            ${character.age ? `<div class="card-info"><strong>Âge:</strong> ${character.age} ans</div>` : ''}
            ${character.occupation ? `<div class="card-info"><strong>Métier:</strong> ${character.occupation}</div>` : ''}
            ${character.gender ? `<div class="card-info"><strong>Genre:</strong> ${character.gender}</div>` : ''}
            ${displayPhrases.length > 0 ? `
                <div class="phrases">
                    <strong>Phrases célèbres:</strong>
                    ${displayPhrases.map(phrase => `<div class="phrase-item">"${phrase}"</div>`).join('')}
                </div>
            ` : ''}
        `;
        
        grid.appendChild(card);
    });
}

// Rendu des épisodes
function renderEpisodes(episodes) {
    const grid = document.getElementById('episodes-grid');
    
    episodes.forEach(episode => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Utiliser le CDN avec la taille 500px pour les cartes
        const imagePath = episode.image_path ? `${CDN_BASE_URL}/500${episode.image_path}` : '';
        
        card.innerHTML = `
            ${imagePath ? `<img src="${imagePath}" alt="${episode.name}" class="card-image" onerror="this.style.display='none'">` : ''}
            ${episode.season && episode.episode_number ? `
                <div class="episode-number">S${String(episode.season).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')}</div>
            ` : ''}
            <h3>${episode.name || 'Sans titre'}</h3>
            ${episode.airdate ? `<div class="card-info"><strong>Diffusion:</strong> ${new Date(episode.airdate).toLocaleDateString('fr-FR')}</div>` : ''}
            ${episode.synopsis ? `<div class="card-info" style="margin-top: 10px;">${episode.synopsis}</div>` : ''}
        `;
        
        grid.appendChild(card);
    });
}

// Rendu des lieux
function renderLocations(locations) {
    const grid = document.getElementById('locations-grid');
    
    locations.forEach(location => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Utiliser le CDN avec la taille 500px pour les cartes
        const imagePath = location.image_path ? `${CDN_BASE_URL}/500${location.image_path}` : '';
        
        card.innerHTML = `
            ${imagePath ? `<img src="${imagePath}" alt="${location.name}" class="card-image" onerror="this.style.display='none'">` : ''}
            <h3>${location.name || 'Sans nom'}</h3>
            ${location.town ? `<div class="card-info"><strong>Ville:</strong> ${location.town}</div>` : ''}
            ${location.use ? `<div class="location-address">🏢 ${location.use}</div>` : ''}
        `;
        
        grid.appendChild(card);
    });
}

// Afficher le loader
function showLoader(tab) {
    const loader = document.getElementById(`${tab}-loader`);
    if (loader) loader.classList.add('active');
}

// Masquer le loader
function hideLoader(tab) {
    const loader = document.getElementById(`${tab}-loader`);
    if (loader) loader.classList.remove('active');
}

// Afficher une erreur
function showError(tab, message) {
    const grid = document.getElementById(`${tab}-grid`);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'empty-state';
    errorDiv.innerHTML = `<h3>❌ ${message}</h3>`;
    grid.appendChild(errorDiv);
}

