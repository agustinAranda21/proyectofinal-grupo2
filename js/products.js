const categoria = localStorage.getItem('catID'); // Ya que los archivos index.js y categories.js ya incluyen la función de guardar la id de la categoría en localStorage, accedemos a ella
const DATA_URL = "https://japceibal.github.io/emercado-api/cats_products/" + categoria + ".json"; // y reemplazamos en la url por la id de la api correspondiente
const container = document.getElementById("product-list");
const ordenar_desc = document.getElementById('priceDesc');
const ordenar_asc = document.getElementById('priceAsc');
const ordenar_rel = document.getElementById('rel');
const minimo = document.getElementById('rangeFilterCountMin');
const maximo = document.getElementById('rangeFilterCountMax');
const limpiar = document.getElementById('clearRangeFilter');
const titulo = document.getElementById('categoryName');
const searchBar = document.getElementById('buscador');
let products = "";
let coincidencias = false;

// Fetch---------------------------------------------------------
function fetchData(funcion) {
  try {
    return fetch(DATA_URL)
    .then(response => response.json())
    .then(data => {
      funcion(data);
      titulo.innerText = data.catName;
    })
  } catch {
    alert("ERROR!" + response.status);
  };
};

// Función para asignar id del producto al localStorage---------------------------------------------------------------
function setProdID(id) {
  localStorage.setItem("prodID", id);
  window.location = "product-info.html"
};



// Función para mostrar los productos------------------------------------------------------------------------------------------------------------------------------------------------
function showProducts(data) {
  let htmlContentToAppend = "";
  let products = data.products; 
    for (let product of products) {     
        htmlContentToAppend += `
        <div onclick="setProdID(${product.id})" class="container list-group m-4 producto cursor-active" id="${product.id}" data-name="${product.name}" data-description="${product.description}" data-cost="${product.cost}"}>
        <div class="product row list-group-item d-flex justify-content-between">
        <div class="col-3">
          <img src="${product.image}" alt="${product.name}" class="product-image img-thumbnail">
        </div>
        <div class="col-7">
          <h2 class="product-name">${product.name}</h2>
          <p class="product-description">${product.description}</p>
          <p class="product-cost">${product.currency} ${product.cost}</p>
        </div>
        <div class="col-2 text-muted">
          <p class="product-sold">${product.soldCount} vendidos</p>
        </div>
        </div>
        </div>
      `;
    };
    let mensaje = `<h3 class="filtro" id="mensaje">No hay elementos que coincidan con su búsqueda.</h3>`
    htmlContentToAppend += mensaje;
    container.innerHTML = htmlContentToAppend;
};

// Funciones para mostrar u ocultar productos mediante el uso de la clase filtro----------------------------------------------------------------------
function filterOn(element) {
  element.classList.add("filtro");
};

function filterOff(element){
  element.classList.remove("filtro");
};


// Función para ordenar los productos-------------------------------------------------------------------
function sort(data, criteria, by){
  let order = "";
  if (criteria === "asc"){
    order = 1;
  } else if (criteria === "desc"){
    order = -1;
  }
  limpiar.removeAttribute("disabled");
  let sortedList = [];
  let numbers = [];
  for (product of data.products){
      numbers.push(product[by]);
  }
  numbers.sort((a, b) => (a - b) * order);
  for (precio of numbers){
    for (product of data.products){
      if (precio == product[by]  && !(sortedList.includes(product))){
        sortedList.push(product);
      };
    };
  };
  showProducts({products: sortedList});
};


// Función del buscador----------------------------------------------------------------------------------------------------------------------------------------------------
 function buscador (e){ // *el parámetro data no se utilizaba, probé a borrarlo aquí y en la escucha y no se rompió nada, por lo que podemos concluir que no era necesario.
  if (e.target.matches("#buscador")){ 
    const productos = document.querySelectorAll(".producto");
    coincidencias = false
    productos.forEach(product =>{
      if (product.dataset.name.toLowerCase().includes(e.target.value.toLowerCase()) || product.dataset.description.toLowerCase().includes(e.target.value.toLowerCase()) ){                                   
        filterOff(product);
        coincidencias = true
      } else{
        filterOn(product);
      };
    });    
  };
  noResults();
};
// En products.html agregue el buscador con el id="buscador". 
// En la funcion showProducts modifique la primer linea de lo que se apendea esto:
// <div class="container list-group m-4 producto" id="${product.name}">
// le agregue como id el nombre del producto para compararlo con la busqueda.
// en styles.css agregue la clase filtro para que cuando se le agrega al div no se vea.

// Función para búsquedas sin resultados-----------------------------------------------------
function noResults(){
  const noCoincidence = document.getElementById('mensaje');

  if (coincidencias) {
    filterOn(noCoincidence);
  } else{
    filterOff(noCoincidence);
  };
};


// Filtro por rango de precios---------------------------------------------------------------
function costRange(data, e) {
  showProducts(data);
  const productos = document.querySelectorAll(".producto");

  if (e.target.matches('#rangeFilterCountMin')) {
    if (minimo.value && maximo.value) {
      bothInputs(productos);
    } else if (minimo.value){
      oneInput("minimo", productos);
    };
  } ;
  if (e.target.matches('#rangeFilterCountMax')) {
    if (maximo.value && minimo.value) {
      bothInputs(productos);
    } else if (maximo.value) {
      oneInput("maximo", productos);
    };
  };
  e.stopPropagation();
};

// Funciones auxiliares para filtro por rango de precios-------------------------------------
function bothInputs(productos){
  productos.forEach(product =>{ 
    const price = product.dataset.cost;
    parseInt(price) >= parseInt(minimo.value) && parseInt(price) <= parseInt(maximo.value)
      ? (filterOff(product), coincidencias = true) 
      : filterOn(product); 
    });
};

function oneInput(input, productos){
  productos.forEach(product =>{
    const price = product.dataset.cost;
    if (input === "maximo"){
      parseInt(price) <= parseInt(maximo.value)
      ? (filterOff(product), coincidencias = true) 
      : filterOn(product); 
    } else if (input === "minimo"){
      parseInt(price) >= parseInt(minimo.value)
      ? (filterOff(product), coincidencias = true)
      : filterOn(product); 
    };    
  });
};


function minOfMax(){
  if (minimo.value > maximo.value) {
    maximo.value = minimo.value;
    maximo.setAttribute("min", minimo.value);
    };
    maximo.focus();
    maximo.select();
};


// Función del botón limpiar--------------------------------------------------------------------
function clean(){
  minimo.value = "";
  maximo.value = "";
  searchBar.value = "";
  fetchData(showProducts);
  limpiar.setAttribute("disabled", "");
};


// Event listeners------------------------------------------------------------------------------
window.addEventListener('load', () => {
  fetchData(showProducts);  
});

ordenar_asc.addEventListener('click', () => {
  fetchData(data => sort(data, "asc", "cost"));  
});

ordenar_desc.addEventListener('click', () => {
  fetchData(data => sort(data, "desc", "cost"));  
});

ordenar_rel.addEventListener('click', () => {
  fetchData(data => sort(data, "desc", "soldCount"));  
});

maximo.addEventListener('focus', () => {
  minOfMax();
});

searchBar.addEventListener('keyup', e =>{ // * Cambié window por searchBar para que sólo escuche los keyups en caso de que el foco esté en la barra de búsqueda.
  fetchData(buscador(e))
});

searchBar.addEventListener('input', () => { //*Esta escucha la agregué porque al borrar un input manualmente (es decir sin usar el botón limpiar), el botón limpiar no se
  if (searchBar.value.trim() === '') {      //* deshabilitaba, dejándolo utilizable en situaciones innecesarias. 
    clean();                                
  } else{                                   
    limpiar.removeAttribute("disabled");
  }
});

minimo.addEventListener('keyup', e =>{
  fetchData(data => costRange(data, e));
});

maximo.addEventListener('keyup', e =>{
  fetchData(data => costRange(data, e))
});

minimo.addEventListener('input', () => { //*Esta escucha la agregué porque al borrar un input manualmente (es decir sin usar el botón limpiar), el botón limpiar no se
  if (minimo.value.trim() === '' && maximo.value.trim() === '') {      //* deshabilitaba, dejándolo utilizable en situaciones innecesarias. 
    clean();                             
  } else{                                   
    limpiar.removeAttribute("disabled");
  };
});

maximo.addEventListener('input', () => { //*Esta escucha la agregué porque al borrar un input manualmente (es decir sin usar el botón limpiar), el botón limpiar no se
  if (maximo.value.trim() === '' && minimo.value.trim() === '') {      //* deshabilitaba, dejándolo utilizable en situaciones innecesarias. 
    clean();                               
  } else{                                   
    limpiar.removeAttribute("disabled");
  };
});

limpiar.addEventListener('click', () => {
  clean()
});

