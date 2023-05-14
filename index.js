const PAGE_SIZE = 10
let currentPage = 1;
let pokemonList = []

function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  }
  return str.join(' ');
}

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  const startPage = Math.max(currentPage - 2, 1);
  const endPage = Math.min(currentPage + 2, numPages);

  $('#pagination').append(`
      <button class="btn btn-warning page ml-1" id="firstBtn">First</button>
      <button class="btn btn-warning page ml-1" id="prevBtn">Previous</button>
  `);

  for (let i = startPage; i <= endPage; i++) {
    $('#pagination').append(`
      <button class="btn btn-warning page ml-1 numberedButtons" value="${i}">${i}</button>
    `);
  }

  $('#pagination').append(`
      <button class="btn btn-warning page ml-1" id="nextBtn">Next</button>
      <button class="btn btn-warning page ml-1" id="lastBtn">Last</button>
  `);
}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3 class="pokeName">${titleCase(res.data.name)}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-warning" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `)
  })
}

const filterButtons = async () => {
  $('#filters').append(`
    <input type="checkbox" value="clear" onclick="window.location.reload()">
    <label>clear filters</label>
  `);

  const type = await axios.get('https://pokeapi.co/api/v2/type');
  console.log(type.data.results);
  for (let i = 0; i < type.data.results.length; i++) {
    $('#filters').append(`
    <input type="checkbox" value="${type.data.results[i].name}" onclick="filterByType('${type.data.results[i].name}')">
    <label> ${type.data.results[i].name}</label>
  `);

  }
}


const filterByType = async (type) => {
  $('#pokeCards').empty();
  const res = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
  const pokemonList = res.data.pokemon.map((pokemon) => pokemon.pokemon);
  console.log(pokemonList.length);
  $('#text-header').empty();
  $('#text-header').append(`
  <h2>Showing 10 out of ${pokemonList.length} Pokemon</h2>
  `);
  paginate(currentPage, PAGE_SIZE, pokemonList);
  const numPages = Math.ceil(pokemonList.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
};

const setup = async () => {
  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemonList = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemonList);
  const numPages = Math.ceil(pokemonList.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
  filterButtons();

  $('body').on('click', '.pokeCard', async function (e) {

    const pokemonName = $(this).attr('pokeName')
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    const types = res.data.types.map((type) => type.type.name);
    console.log(types);
    $('.modal-body').html(`
      <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
          <h3>Abilities</h3>
          <ul>
            ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
          </ul>
        </div>

        <div>
          <h3>Stats</h3>
          <ul>
            ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
          </ul>
        </div>

      </div>
      <h3>Types</h3>
      <ul>
        ${types.map((type) => `<li>${type}</li>`).join('')}

          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemonList)
    updatePaginationDiv(currentPage, numPages)
  })

  $('body').on('click', "#prevBtn", async function (e) {
    if (currentPage > 1) {
      currentPage--;
      paginate(currentPage, PAGE_SIZE, pokemonList);
      updatePaginationDiv(currentPage, numPages);
    }
  });

  $('body').on('click', "#nextBtn", async function (e) {
    if (currentPage < numPages) {
      currentPage++;
      paginate(currentPage, PAGE_SIZE, pokemonList);
      updatePaginationDiv(currentPage, numPages);
    }
  });

  $('body').on('click', "#firstBtn", async function (e) {
    currentPage = 1;
    paginate(currentPage, PAGE_SIZE, pokemonList);
    updatePaginationDiv(currentPage, numPages);
  });

  $('body').on('click', "#lastBtn", async function (e) {
    currentPage = numPages;
    paginate(currentPage, PAGE_SIZE, pokemonList);
    updatePaginationDiv(currentPage, numPages);
  });

}

$(document).ready(setup)