(function () {
    const lat = -6.4864517;
    const lng = -76.3728061;
    const mapa = L.map('mapa-inicio').setView([lat, lng], 15);

    let markers = new L.FeatureGroup().addTo(mapa)

    let propiedades = []


    //filtros para seleccionar precio o categorias 
    const filtros = {
        categoria: '',
        precio: ''
    }

    const categoriasSelect = document.querySelector('#categorias')
    const precioSelect = document.querySelector('#precios')

    L.tileLayer('https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // FILTRADO DE CATEGORIAS Y PRECIOS
    categoriasSelect.addEventListener('change', e => {
        filtros.categoria = +e.target.value
        filtrarPropiedades()
    })

    precioSelect.addEventListener('change', e => {
        filtros.precio = +e.target.value
        filtrarPropiedades()
    })

    const obtenerPropiedades = async () => {
        try {
            const url = '/api/propiedades/'
            const respuesta = await fetch(url)
            propiedades = await respuesta.json()

            mostrarPropiedades(propiedades)

        } catch (error) {
            console.log(error);
        }
    }

    const mostrarPropiedades = propiedades => {
        // limpiar los pines previos 
        markers.clearLayers()


        propiedades.forEach(propiedad => {
            // agregando los pines 
            const marker = L.marker([propiedad?.lat, propiedad?.lng], {
                autoPan: true
            })
                .addTo(mapa)
                .bindPopup(`
                <p class="text-indigo-600 font-bold text-lg">${propiedad?.categoria?.nombre}</p>
                <h1 class="text-lg font-extrabold uppercase my-3">${propiedad?.titulo}</h1>
                <img src="/uploads/${propiedad?.imagen}" alt="Imagen de la propeidad ${propiedad?.titulo}">
                <p class="text-gray-600 font-bold text-lg">Precio: ${propiedad?.precio?.nombre}</p>
                <a href="/propiedad/${propiedad?.id}" class="bg-indigo-600 block p-2 text-center font-bold upperca">Ver Propiedad</a>
            `)

            markers.addLayer(marker)
        })
    }
    const filtrarPropiedades = () => {

        const resultado = propiedades.filter(filtrarCategoria).filter(filtrarPrecio)
        mostrarPropiedades(resultado);
    }

    const filtrarCategoria = (propiedad) => {
        return filtros.categoria ? propiedad.categoriaID === filtros.categoria : propiedad
    }

    const filtrarPrecio = (propiedad) => {
        return filtros.precio ? propiedad.precioID === filtros.precio : propiedad
    }

    obtenerPropiedades()
})()