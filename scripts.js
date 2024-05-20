const pokemonContainer = document.getElementById('pokemon-container');
const pokemonModal = new bootstrap.Modal(document.getElementById('pokemonModal'));
const pokemonDetails = document.getElementById('pokemon-details');
const pageButtons = document.getElementById('page-buttons');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const headerText = document.getElementById('header-text');
const typeFilters = document.getElementById('type-filters');
const applyFiltersButton = document.getElementById('apply-filters');

let currentPage = 1;
const pageSize = 10;
let totalPages = 0;
let totalPokemon = 0;
let selectedTypes = [];
let allPokemon = [];
let filteredPokemon = [];

function fetchPokemons(page) {
    const offset = (page - 1) * pageSize;
    const currentPagePokemon = filteredPokemon.slice(offset, offset + pageSize);

    displayPokemons(currentPagePokemon);
    updatePagination();
    updateHeader();
}

function fetchAllPokemons() {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=10000')
        .then(response => response.json())
        .then(data => {
            const promises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
            return Promise.all(promises);
        })
        .then(dataArray => {
            allPokemon = dataArray;
            filteredPokemon = allPokemon; // Initialize filteredPokemon with all Pokémon
            totalPokemon = allPokemon.length;
            totalPages = Math.ceil(totalPokemon / pageSize);
            fetchPokemons(currentPage);
        })
        .catch(error => console.error('Error fetching all Pokémon:', error));
}

function displayPokemons(pokemons) {
    pokemonContainer.innerHTML = '';
    pokemons.forEach(data => {
        const card = document.createElement('div');
        card.className = 'col-sm-3 col-md-2 col-lg-2 card'; // Adjusting column size here
        card.innerHTML = `
            <img src="${data.sprites.front_default}" class="card-img-top" alt="${data.name}">
            <div class="card-body" style="text-align: center">
                <h5 class="card-title">${data.name.toUpperCase()}</h5>
                <button class="btn btn-primary" onclick="showDetails('${data.name}')">Details</button>
            </div>
        `;
        pokemonContainer.appendChild(card);
    });
}

function showDetails(name) {
    const pokemon = allPokemon.find(p => p.name === name);
    if (pokemon) {
        pokemonDetails.innerHTML = `
            <h5>${pokemon.name.toUpperCase()} - DATA ID: ${pokemon.id}</h5>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <img src="${pokemon.sprites.back_default}" alt="${pokemon.name}">
            <p>Abilities:
                <ul>
                    ${pokemon.abilities.map(abilityInfo => `<li>${abilityInfo.ability.name}</li>`).join('')}
                </ul>
            </p>
            <p> Stats:
                <ul>
                    ${pokemon.stats.map(statInfo => `<li>${statInfo.stat.name.toUpperCase()}: ${statInfo.base_stat}</li>`).join('')}
                </ul>
            </p>
            <p>Type/s:
            <ul>
                ${pokemon.types.map(typeInfo => `<li>${typeInfo.type.name}</li>`).join('')}
            </ul>
        `;
        pokemonModal.show();
    }
}

function fetchPokemonTypes() {
    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            displayTypeFilters(data.results);
        })
        .catch(error => console.error('Error fetching Pokémon types:', error));
}

function displayTypeFilters(types) {
    types.forEach(type => {
        const typeCheckbox = document.createElement('div');
        typeCheckbox.className = 'col-md-2';
        typeCheckbox.innerHTML = `
            <input type="checkbox" id="${type.name}" name="type" value="${type.name}">
            <label for="${type.name}">${type.name}</label>
        `;
        typeFilters.appendChild(typeCheckbox);
    });
}

function applyFilters() {
    selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(checkbox => checkbox.value);
    if (selectedTypes.length > 0) {
        filterPokemonsByType();
    } else {
        filteredPokemon = allPokemon;
        totalPokemon = allPokemon.length;
        totalPages = Math.ceil(totalPokemon / pageSize);
        fetchPokemons(currentPage);
    }
}

function filterPokemonsByType() {
    filteredPokemon = allPokemon.filter(pokemon => 
        selectedTypes.every(type => pokemon.types.some(typeInfo => typeInfo.type.name === type))
    );
    totalPokemon = filteredPokemon.length;
    totalPages = Math.ceil(totalPokemon / pageSize);
    fetchPokemons(currentPage);
}

function updatePagination() {
    pageButtons.innerHTML = '';
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('li');
        pageButton.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageButton.innerHTML = `<button class="page-link" onclick="changePage(${i})">${i}</button>`;
        pageButtons.appendChild(pageButton);
    }

    prevButton.style.display = currentPage === 1 ? 'none' : 'block';
    nextButton.style.display = currentPage === totalPages ? 'none' : 'block';
}

function updateHeader() {
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(start + pageSize - 1, totalPokemon);
    headerText.innerText = `Showing ${start} - ${end} of ${totalPokemon} Pokémon`;
}

function changePage(page) {
    currentPage = page;
    fetchPokemons(currentPage);
}

prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
        changePage(currentPage - 1);
    }
});

nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
        changePage(currentPage + 1);
    }
});

applyFiltersButton.addEventListener('click', applyFilters);

document.addEventListener('DOMContentLoaded', () => {
    fetchAllPokemons();
    fetchPokemonTypes();
});