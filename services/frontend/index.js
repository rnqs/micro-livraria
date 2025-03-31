function newBook(book) {
    const div = document.createElement('div');
    div.className = 'column is-4';
    div.innerHTML = `
        <div class="card is-shady">
            <div class="card-image">
                <figure class="image is-4by3">
                    <img
                        src="${book.photo}"
                        alt="${book.name}"
                        class="modal-button"
                    />
                </figure>
            </div>
            <div class="card-content">
                <div class="content book" data-id="${book.id}">
                    <div class="book-meta">
                        <p class="is-size-4">R$${book.price.toFixed(2)}</p>
                        <p class="is-size-6">Disponível em estoque: 5</p>
                        <h4 class="is-size-3 title">${book.name}</h4>
                        <p class="subtitle">${book.author}</p>
                    </div>
                    <div class="field has-addons">
                        <div class="control">
                            <input class="input" type="text" placeholder="Digite o CEP" />
                        </div>
                        <div class="control">
                            <a class="button button-shipping is-info" data-id="${book.id}"> Calcular Frete </a>
                        </div>
                    </div>
                    <button class="button button-buy is-success is-fullwidth">Comprar</button>
                </div>
            </div>
        </div>`;
    return div;
}

function calculateShipping(id, cep) {
    fetch('http://localhost:3000/shipping/' + cep)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            swal('Frete', `O frete é: R$${data.value.toFixed(2)}`, 'success');
        })
        .catch((err) => {
            swal('Erro', 'Erro ao consultar frete', 'error');
            console.error(err);
        });
}

function searchProductById(id) {
    const books = document.querySelector('.books');
    books.innerHTML = ''; // Limpa a lista atual

    fetch('http://localhost:3000/product/' + id)
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((book) => {
            if (book) {
                books.appendChild(newBook(book));
                setupEventListeners();
            } else {
                swal('Erro', 'Produto não encontrado', 'error');
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao buscar o produto', 'error');
            console.error(err);
        });
}

function loadAllProducts() {
    const books = document.querySelector('.books');
    books.innerHTML = ''; // Limpa a lista atual

    fetch('http://localhost:3000/products')
        .then((data) => {
            if (data.ok) {
                return data.json();
            }
            throw data.statusText;
        })
        .then((data) => {
            if (data) {
                data.forEach((book) => {
                    books.appendChild(newBook(book));
                });
                setupEventListeners();
            }
        })
        .catch((err) => {
            swal('Erro', 'Erro ao listar os produtos', 'error');
            console.error(err);
        });
}

function setupEventListeners() {
    document.querySelectorAll('.button-shipping').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const cep = document.querySelector(`.book[data-id="${id}"] input`).value;
            calculateShipping(id, cep);
        });
    });

    document.querySelectorAll('.button-buy').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('.book').getAttribute('data-id');
            const cep = document.querySelector(`.book[data-id="${id}"] input`).value;

            if (!cep) {
                swal('Erro', 'Por favor, digite um CEP válido', 'error');
                return;
            }

            fetch('http://localhost:3000/shipping/' + cep)
                .then((data) => {
                    if (data.ok) {
                        return data.json();
                    }
                    throw data.statusText;
                })
                .then((shippingData) => {
                    swal(
                        'Compra realizada com sucesso!',
                        `Valor do frete: R$${shippingData.value.toFixed(2)}\n` +
                            'Sua compra foi processada com sucesso!',
                        'success'
                    );
                })
                .catch((err) => {
                    swal('Erro', 'Erro ao processar a compra', 'error');
                    console.error(err);
                });
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Carrega todos os produtos inicialmente
    loadAllProducts();

    // Adiciona evento de busca por ID
    document.getElementById('search-button').addEventListener('click', () => {
        const id = document.getElementById('search-id').value;
        if (!id) {
            swal('Erro', 'Por favor, digite um ID válido', 'error');
            return;
        }
        searchProductById(id);
    });
});
