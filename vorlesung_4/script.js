const productTable = document.querySelector('#productTable');
const singleProduct = document.querySelector('#singleProduct');
const filter = document.querySelector('#filter');
const searchInput = document.querySelector('#searchInput');

const tableHead = document.createElement('thead');
{
    const thumbnail = document.createElement('th');
    const title = document.createElement('th');
    const brand = document.createElement('th');
    const category = document.createElement('th');
    const price = document.createElement('th');
    
    thumbnail.innerText = 'Thumbnail';
    title.innerText = 'Product Name';
    brand.innerText = 'Brand';
    category.innerText = 'Category';
    price.innerText = 'Price';
    
    tableHead.appendChild(thumbnail);
    tableHead.appendChild(title);
    tableHead.appendChild(brand);
    tableHead.appendChild(category);
    tableHead.appendChild(price);
}

showCategories();

function getAllProducts() {
    fetch('https://dummyjson.com/products')
        .then(res => res.json())
        .then(json => {
            showProducts(json.products);
            console.log(json);
        });
}

function searchForProducts() {
    fetch(`https://dummyjson.com/products/search?q=${searchInput.value}`)
        .then(res => res.json())
        .then(json => showProducts(json.products));
}

function getProductsOfCategory(name) {
    fetch(`https://dummyjson.com/products/category/${name}`)
        .then(res => res.json())
        .then(json => showProducts(json.products));
}

function showProducts(products) {
    clearContent();

    productTable.appendChild(tableHead);
    products.forEach(product => {
        const row = document.createElement('tr');
        const thumbnailCell = document.createElement('td');
        const thumbnail = document.createElement('img');
        const titleCell = document.createElement('td');
        const title = document.createElement('button');
        const brand = document.createElement('td');
        const categoryCell = document.createElement('td');
        const category = document.createElement('button');
        const price = document.createElement('td');

        thumbnail.width = '100';
        thumbnail.height = '100';
        thumbnail.src = product.thumbnail;
        thumbnail.alt = product.title;
        title.innerText = product.title;
        title.onclick = () => showSingle(product.id);
        brand.innerText = product.brand;
        category.innerText = product.category;
        category.onclick = () => getProductsOfCategory(product.category);
        price.innerText = '$' + product.price;

        thumbnailCell.appendChild(thumbnail); 
        titleCell.appendChild(title);
        categoryCell.appendChild(category);
        row.appendChild(thumbnailCell);
        row.appendChild(titleCell);
        row.appendChild(brand);
        row.appendChild(categoryCell);
        row.appendChild(price);

        productTable.appendChild(row);
    });
}

function getRandomProduct() {
    fetch('https://dummyjson.com/products')
        .then(res => res.json())
        .then(json => showSingle(Math.floor(Math.random() * json.limit) + 1 ));
}

function showSingle(id) {
    clearContent();

    fetch(`https://dummyjson.com/products/${id}`)
        .then(res => res.json())
        .then(product => {
            console.log(product);

            const title = document.createElement('h1');
            const desc = document.createElement('p');
            const pricing = document.createElement('p');
            const img = document.createElement('img');

            title.innerText = product.title;
            desc.innerText = product.description;
            pricing.innerHTML = `price: <span class="big">$${product.price}</span> BUY NOW only <span class="big">${product.stock}</span> items left!`;
            img.src = product.images[0];
            img.alt = product.title;    

            singleProduct.appendChild(title);
            singleProduct.appendChild(desc);
            singleProduct.append(pricing);
            singleProduct.appendChild(img);
        });
}

function showCategories() {
    filter.innerHTML = '';
    fetch('https://dummyjson.com/products/categories')
        .then(res => res.json())
        .then(json => {
            json.forEach(category => {
                const btn = document.createElement('button');
                btn.innerText = category;
                btn.onclick = () => getProductsOfCategory(category);
                filter.appendChild(btn);
            })
        });
}

function clearContent() {
    productTable.innerHTML = '';
    singleProduct.innerHTML = '';
}