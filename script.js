let trainers = JSON.parse(localStorage.getItem('trainers')) || [];
let selectedPokemons = {};
let currentTrainerIndex = null;
let partialReturnSelection = {};
let history = JSON.parse(localStorage.getItem('history')) || [];

// Dados dos Pokémons por clã
const clans = {
    ironhard: [
        'Shiny Forretress', 'Shiny Mawile', 'Magneton', 'Perrserker', 'Bronzong', 'Shiny Klinklang', 'Klinklang', 'Lucario'
    ],
    seavell: [
        'Mega Glalie', 'Shiny Floatzel', 'Beartic', 'Vaporeon', 'Shiny Vaporeon Def', 'Shiny Kingler', 'Gyarados', 'Mega Blastoise', 'Vanilluxe', 'Alolan Ninetales', 'Froslass', 'Lapras', 'Avalugg', 'Alomomola', 'Shiny Vaporeon Atk'
    ],
    wingeon: [
        'Shiny Fearow', 'Mega Pidgeot', 'Shiny Beautifly', 'Goodra', 'Staraptor', 'Braviary', 'Crobat', 'Haxorus', 'Shiny Druddigon', 'Dragonite', 'Garchomp'
    ],
    psycraft: [
        'Shiny Gardevoir', 'Shiny Gothitelle', 'Galarian Rapidash', 'Florges', 'Hatterene', 'Granbull', 'Sylveon', 'Clefable', 'Espeon', 'Shiny Espeon', 'Shiny Starmie'
    ],
    gardestrike: [
        'Mega Lopunny', 'Shiny Hariyama', 'Sawk', 'Throh', 'Elite Hitmontop', 'Champion Primeape', 'Conkeldurr', 'Elite Hitmonlee', 'Smeargle7'
    ],
    malefic: [
        'Mightyena', 'Zoroark', 'Mismagius Atk8', 'Cofagrigus', 'Mimikyu', 'Seviper', 'Shiny Muk', 'Gengar', 'Mismagius Atk7', 'Nidoking Boost', 'Banette', 'Muk', 'Shiny Umbreon', 'Nidoking Atk', 'Alolan Muk', 'Alolan Persian', 'Shiny Weezing', 'Dusclops', 'Shiny Arbok', 'Shiny Garbodor'
    ],
    raibolt: [
        'Shiny Pachirisu', 'Shiny Electrode'
    ],
    volcanic: [
        'Shiny Ninetales', 'Shiny Chandelure', 'Shiny Heatmor', 'Arcanine', 'Ninetales', 'Shiny Flareon', 'Magmar', 'Pyroar Female', 'Alolan Marowak', 'Talonflame', 'Volcarona'
    ],
    orebound: [
        'Shiny Golem', 'Shiny Rampardos', 'Rampardos', 'Palossand', 'Shiny Krookodile', 'Golem', 'Hippowdon Female', 'Sandaconda', 'Nidoqueen', 'Shiny Golurk', 'Shiny Donphan', 'Omastar', 'Mudsdale'
    ],
    naturia: [
        'Shiny Sceptile', 'Shiny Yanmega', 'Shiny Lilligant', 'Shiftry', 'Abomasnow'
    ]
};

// Função para carregar Pokémons de um clã
function loadClan(clan) {
    // Esconder a tela inicial
    document.getElementById('initialScreen').style.display = 'none';

    // Mostrar o carrinho
    document.getElementById('pokemonCart').style.display = 'block';

    const pokemonSelection = document.getElementById('pokemonSelection');
    pokemonSelection.innerHTML = ''; // Limpa a lista atual

    clans[clan].forEach(pokemon => {
        const div = document.createElement('div');
        div.className = 'pokemon-item';
        div.id = `${pokemon}-item`;
        div.innerHTML = `
            <span>${pokemon}</span>
            <div class="buttons">
                <button onclick="adjustQuantity('${pokemon}', -1)">-</button>
                <button onclick="adjustQuantity('${pokemon}', 1)">+</button>
            </div>
        `;
        pokemonSelection.appendChild(div);
    });

    updatePokemonAvailability(); // Atualiza a disponibilidade dos Pokémons
}

// Função para alternar o menu hambúrguer
// Função para alternar o menu no modo mobile
function toggleMenu() {
    const menu = document.getElementById('menu');
    const overlay = document.getElementById('menuOverlay');
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Função para fechar o menu ao clicar fora (no modo mobile)
function closeMenuOnClickOutside(event) {
    const menu = document.getElementById('menu');
    const overlay = document.getElementById('menuOverlay');
    if (!menu.contains(event.target) && !document.querySelector('.menu-icon').contains(event.target)) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
    }
}

// Adicionar evento de clique fora para fechar o menu
document.addEventListener('click', closeMenuOnClickOutside);

// Função para ajustar a quantidade de Pokémons
function adjustQuantity(pokemonName, change) {
    const pokemonItem = document.getElementById(`${pokemonName}-item`);

    if (change === 1) {
        // Verificar se o Pokémon já está em uso
        if (history.some(entry => entry.pokemon === pokemonName && !entry.returned)) {
            alert(`${pokemonName} já está em uso.`);
            return;
        }
        selectedPokemons[pokemonName] = 1;
        pokemonItem.classList.add('selected'); // Adicionar classe temporária
    } else if (change === -1) {
        if (selectedPokemons[pokemonName]) {
            selectedPokemons[pokemonName] = 0;
            pokemonItem.classList.remove('selected'); // Remover classe temporária
        }
    }
    updatePokemonAvailability();
}

// Função para salvar a seleção
async function saveSelection() {
    const trainerName = document.getElementById('trainerName').value;

    if (!trainerName) {
        alert("Por favor, insira seu nome.");
        return;
    }

    const pokemonsToSave = Object.keys(selectedPokemons)
        .filter(pokemon => selectedPokemons[pokemon] === 1);

    if (pokemonsToSave.length === 0) {
        alert("Nenhum Pokémon selecionado.");
        return;
    }

    const dateTime = new Date().toLocaleString();
    const trainer = { name: trainerName, pokemons: pokemonsToSave, date: dateTime };

    try {
        await addTrainer(trainer); // Adicionar treinador via API
        pokemonsToSave.forEach(pokemon => {
            addHistoryEntry({ pokemon, trainer: trainerName, date: dateTime, returned: false }); // Adicionar ao histórico via API
        });
        renderTrainers();
        selectedPokemons = {};
        document.getElementById('trainerName').value = '';
        updatePokemonAvailability();
    } catch (err) {
        console.error('Erro ao salvar:', err);
    }
}

// Função para renderizar a lista de treinadores
async function renderTrainers() {
    const pokemonList = document.getElementById('pokemonList');
    pokemonList.innerHTML = '';

    try {
        const trainers = await getTrainers(); // Obter treinadores via API
        trainers.forEach((trainer, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="trainer-name">${trainer.name}</span>
                <span class="trainer-date">(${trainer.date})</span>:
                <span class="pokemon-names">${trainer.pokemons.join(', ')}</span>
                <div class="actions">
                    <button onclick="returnPokemon(${index})">Devolver Tudo</button>
                    <button onclick="openPartialReturnModal(${index})">Devolver Parcialmente</button>
                </div>
            `;
            pokemonList.appendChild(li);
        });
    } catch (err) {
        console.error('Erro ao carregar treinadores:', err);
    }
}

// Função para devolver todos os Pokémons
async function returnPokemon(index) {
    const returnedPokemons = trainers[index].pokemons;
    const dateTime = new Date().toLocaleString();

    try {
        await deleteTrainer(index); // Remover treinador via API
        returnedPokemons.forEach(pokemon => {
            updateHistoryEntry(index, dateTime); // Atualizar histórico via API
        });
        renderTrainers();
        updatePokemonAvailability();
    } catch (err) {
        console.error('Erro ao devolver Pokémon:', err);
    }
}

function openHistoryModal() {
    const historyModal = document.getElementById('historyModal');
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    // Ordenar o histórico do mais recente para o mais antigo
    const sortedHistory = history.slice().reverse();

    // Agrupar entradas por treinador e data de pego
    const groupedHistory = sortedHistory.reduce((acc, entry) => {
        const key = `${entry.trainer}-${entry.date}`;
        if (!acc[key]) {
            acc[key] = {
                trainer: entry.trainer,
                date: entry.date,
                pokemonsPegos: [],
                pokemonsDevolvidos: [],
                pokemonsEmUso: []
            };
        }
        if (entry.returned) {
            acc[key].pokemonsDevolvidos.push({
                pokemon: entry.pokemon,
                returnDate: entry.returnDate
            });
        } else {
            acc[key].pokemonsEmUso.push(entry.pokemon);
        }
        if (!acc[key].pokemonsPegos.includes(entry.pokemon)) {
            acc[key].pokemonsPegos.push(entry.pokemon);
        }
        return acc;
    }, {});

    // Exibir o histórico consolidado
    for (const key in groupedHistory) {
        const entry = groupedHistory[key];
        const div = document.createElement('div');
        div.className = 'history-item';

        // Linha 1: Treinador pegou os Pokémons
        div.innerHTML += `
            <span class="trainer-name">${entry.trainer}</span>
            <span class="trainer-date">(${entry.date})</span> pegou: ${entry.pokemonsPegos.join(', ')}.<br>
        `;

        // Linha de devoluções (agrupadas)
        if (entry.pokemonsDevolvidos.length > 0) {
            const devolucoesAgrupadas = entry.pokemonsDevolvidos.reduce((acc, devolucao) => {
                if (!acc[devolucao.returnDate]) {
                    acc[devolucao.returnDate] = [];
                }
                acc[devolucao.returnDate].push(devolucao.pokemon);
                return acc;
            }, {});

            for (const dataDevolucao in devolucoesAgrupadas) {
                div.innerHTML += `
                    <span class="trainer-name">${entry.trainer}</span> devolveu em
                    <span class="trainer-date">(${dataDevolucao})</span>:
                    <span class="pokemons-returned">${devolucoesAgrupadas[dataDevolucao].join(', ')}</span>.<br>
                `;
            }
        }

        // Linha de Pokémons em uso
        if (entry.pokemonsEmUso.length > 0) {
            div.innerHTML += `
                <span class="trainer-name">${entry.trainer}</span> ainda está utilizando:
                <span class="pokemons-using">${entry.pokemonsEmUso.join(', ')}</span>.
            `;
        }

        historyList.appendChild(div);
    }

    historyModal.style.display = 'flex';
}

// Função para fechar o modal de histórico
function closeHistoryModal() {
    const historyModal = document.getElementById('historyModal');
    historyModal.style.display = 'none';
}

// Função para abrir o modal de devolução parcial
function openPartialReturnModal(index) {
    currentTrainerIndex = index;
    const modal = document.getElementById('partialReturnModal');
    const partialReturnList = document.getElementById('partialReturnList');
    partialReturnList.innerHTML = '';

    // Inicializar a seleção de devolução parcial
    partialReturnSelection = {};
    trainers[index].pokemons.forEach(pokemon => {
        partialReturnSelection[pokemon] = 0; // Inicialmente, nenhum Pokémon é selecionado para devolução
    });

    // Renderizar a lista de Pokémons no modal
    trainers[index].pokemons.forEach(pokemon => {
        const div = document.createElement('div');
        div.className = 'pokemon-item';
        div.innerHTML = `
            <span>${pokemon}</span>
            <button onclick="adjustPartialReturn('${pokemon}', -1)">-</button>
            <button onclick="adjustPartialReturn('${pokemon}', 1)">+</button>
        `;
        partialReturnList.appendChild(div);
    });

    modal.style.display = 'flex';
    updateModalPokemonAvailability();
}

// Função para ajustar a devolução parcial no modal
function adjustPartialReturn(pokemonName, change) {
    if (change === 1) {
        partialReturnSelection[pokemonName] = 1; // Selecionar para devolução
    } else if (change === -1) {
        partialReturnSelection[pokemonName] = 0; // Remover da seleção de devolução
    }
    updateModalPokemonAvailability();
}

// Função para atualizar a disponibilidade dos Pokémons no modal
function updateModalPokemonAvailability() {
    const partialReturnList = document.getElementById('partialReturnList');
    const items = partialReturnList.querySelectorAll('.pokemon-item');

    items.forEach(item => {
        const pokemonName = item.querySelector('span').textContent;
        if (partialReturnSelection[pokemonName] === 1) {
            item.classList.remove('unavailable');
            item.classList.add('available');
        } else {
            item.classList.remove('available');
            item.classList.add('unavailable');
        }
    });
}

// Função para confirmar a devolução parcial
function confirmPartialReturn() {
    const pokemonsToReturn = Object.keys(partialReturnSelection)
        .filter(pokemon => partialReturnSelection[pokemon] === 1);

    if (pokemonsToReturn.length === 0) {
        alert("Nenhum Pokémon selecionado para devolução.");
        return;
    }

    // Remover os Pokémons selecionados da lista do treinador
    trainers[currentTrainerIndex].pokemons = trainers[currentTrainerIndex].pokemons
        .filter(pokemon => !pokemonsToReturn.includes(pokemon));

    // Atualizar o histórico para marcar como devolvido
    const dateTime = new Date().toLocaleString(); // Data e hora da devolução
    pokemonsToReturn.forEach(pokemon => {
        history.forEach(entry => {
            if (entry.pokemon === pokemon && !entry.returned) {
                entry.returned = true;
                entry.returnDate = dateTime; // Registrar a data de devolução
            }
        });
    });

    // Atualizar o localStorage e a exibição
    localStorage.setItem('trainers', JSON.stringify(trainers));
    localStorage.setItem('history', JSON.stringify(history));
    renderTrainers();
    updatePokemonAvailability();
    closeModal();
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById('partialReturnModal');
    modal.style.display = 'none';
}

// Função para atualizar a disponibilidade dos Pokémons na página principal
function updatePokemonAvailability() {
    const allPokemons = Object.values(clans).flat(); // Todos os Pokémons de todos os clãs

    allPokemons.forEach(pokemon => {
        const pokemonItem = document.getElementById(`${pokemon}-item`);
        if (pokemonItem) {
            const isInUse = history.some(entry => entry.pokemon === pokemon && !entry.returned);
            if (isInUse) {
                pokemonItem.classList.remove('available', 'selected');
                pokemonItem.classList.add('unavailable');
            } else {
                pokemonItem.classList.remove('unavailable');
                if (selectedPokemons[pokemon] === 1) {
                    pokemonItem.classList.add('selected');
                } else {
                    pokemonItem.classList.remove('selected');
                    pokemonItem.classList.add('available');
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Mostrar a tela inicial ao carregar a página
    document.getElementById('initialScreen').style.display = 'block';
    document.getElementById('pokemonCart').style.display = 'none';

    // Carregar treinadores e disponibilidade
    trainers.forEach(trainer => {
        trainer.pokemons.forEach(pokemon => {
            selectedPokemons[pokemon] = 1;
        });
    });
    renderTrainers();
    updatePokemonAvailability();
});