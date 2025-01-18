document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length < 2) {
            searchResults.innerHTML = '';
            searchResults.style.display = 'none';
            return;
        }

        fetch(`/search?term=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(data => {
                displaySearchResults(data);
            })
            .catch(error => {
                console.error('Erreur lors de la recherche:', error);
                searchResults.innerHTML = '<p class="text-danger">Une erreur est survenue lors de la recherche.</p>';
                searchResults.style.display = 'block';
            });
    }

    function displaySearchResults(data) {
        let resultsHtml = '';
        const categories = ['participants', 'formateurs', 'formations', 'domaines'];
        let hasResults = false;

        categories.forEach(category => {
            if (data[category] && data[category].length > 0) {
                hasResults = true;
                resultsHtml += `<h5 class="mt-3">${category.charAt(0).toUpperCase() + category.slice(1)}</h5>`;
                resultsHtml += '<ul class="list-group">';
                data[category].forEach(item => {
                    resultsHtml += `<li class="list-group-item">
                        <a href="/${category}/${item._id}">
                            ${item.nom || item.intitule || (item.prenom + ' ' + item.nom) || item.libelle}
                        </a>
                    </li>`;
                });
                resultsHtml += '</ul>';
            }
        });

        if (hasResults) {
            searchResults.innerHTML = resultsHtml;
            searchResults.style.display = 'block';
        } else {
            searchResults.innerHTML = '<p>Aucun résultat trouvé.</p>';
            searchResults.style.display = 'block';
        }
    }

    function debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        }
    }
});

