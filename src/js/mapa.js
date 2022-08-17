(function () {

    const lat = document.querySelector('#lat').value || -6.4864517;
    const lng = document.querySelector('#lng').value || -76.3728061;
    const mapa = L.map('mapa').setView([lat, lng], 16);
    let marker;

    // Utilizar Provider y GeoCode
    const geocodeService = L.esri.Geocoding.geocodeService()

    // L.tileLayer('https://cdn.lima-labs.com/{z}/{x}/{y}.png?api=demo', {
    //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    // }).addTo(mapa);
    L.tileLayer('https://a.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);
    
    //agregando el PIN
    marker = new L.marker([lat,lng], {
        draggable: true,
        autoPan: true
    }).addTo(mapa)

    //Detectar el movimiento del pin
    marker.on('moveend', function(e){
        marker = e.target
        const posicion = marker.getLatLng()
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng))
        
        //Obtener la informacion de la calle al soltar el pin
        geocodeService.reverse().latlng(posicion, 13).run(function(error, resultado){
            // console.log(resultado);
            marker.bindPopup(resultado.address.LongLabel)

            document.querySelector('.calle').textContent=resultado?.address?.Address ?? ''
            document.querySelector('#calle').value=resultado?.address?.Address ?? ''
            document.querySelector('#lat').value=resultado?.latlng?.lat ?? ''
            document.querySelector('#lng').value=resultado?.latlng?.lng ?? ''
        })

    })

})()