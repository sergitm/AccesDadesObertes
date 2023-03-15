"use strict";

var gMaps;    // Mapa Google Maps

function init(){
    $('#consulta').on('click', consulta);
    $('#dataFutura').hide();
    $('#simbols').hide();
    $('#taulaDades').hide();
    $('#mapa').hide();

}

function consulta(){
    let data = $('#data').val();
    let municipi = $('#municipi').val();
    let tipus = $('#tipus').val();
    let limit = $('#limit').val();

    // Si no se'ns retorna cap error enviem la petició
    if(!validacioDades(data, municipi)){
        
        let dades = {
            "$select" : "*",
            "$limit" : 10,
            "$$app_token" : "x0fIzm8MqVpAawmYUPekjqYGG"
        };
        
        if (data) {
            dades.data = data;
        }
        if (municipi) {
            dades.municipi = municipi;
        }
        if (tipus != '0') {
            dades.tipus_estacio = tipus;
        }
        if (limit) {
            if (limit > 0 && limit <= 100) {
                dades.$limit = limit;
            }
        }
        $.ajax({
            url: "https://analisi.transparenciacatalunya.cat/resource/tasf-thgu.json",
            type: "GET",
            data: dades
        }).done(function(data) {
            if (data.length === 0) {
                alert("No s'han trobat resultats");
            } else {
                $('#mapa').show();
                crearMapa(data);
                $('#taulaDades').show();
                populateTaula(data);
            }
        }).fail(function(error) {
            switch (error.status) {
                case 400:
                    alert("El servidor ha denegat la petició.\nÉs probable que les dades no siguin correctes.");
                    break;
                case 403:
                    alert("Permís denegat al servidor.");
                    break;
                case 404:
                    alert("No s'ha trobat el servidor.");
                    break;
                default:
                    alert(error.responseJSON.message);
                    break;
            }
        });
    }
}
// Validem les dades dels inputs            
function validacioDades(data, municipi){
    let dataActual = dataAvui();
    let errors = {
        data : false,
        municipi: false
    };

    if (data) {   
        if (data > dataActual) {
            $('#data').addClass('is-invalid');
            $('#dataFutura').show();
            errors.data = true;
        } else {
            $('#data').removeClass('is-invalid');
            $('#dataFutura').hide();
            errors.data = false;
        }
    }
    if (municipi) {    
        if (/^[a-z àèéíòóúç]+$/i.test(municipi)) {
            $('#municipi').removeClass('is-invalid');
            $('#simbols').hide();
            errors.municipi = false;
        } else {
            $('#municipi').addClass('is-invalid');
            $('#simbols').show();
            errors.municipi = true;
        }
    }
    // Si no hi han errors de cap tipus retornem false
    if (!errors.data && !errors.municipi) {
        return false;
    } else {
        return true;
    }
}
// Funció que retorna la data d'avui en format yyyy-MM-dd per comprovar que la data de l'input no sigui futura
function dataAvui() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function populateTaula(dades){
    // Buidem la taula per si de cas i la tornem a crear
    $('tbody').empty();

    dades.forEach(fila => {
        let nivell;
        // Iterem cada resultat per buscar les propietats que comencem en 'h', ja que els nivells de contaminant es guarden segons la hora en la que es troben
        for (const [clau, valor] of Object.entries(fila)) {
            // Quan trobem una propietat que comenci amb h, assignem el valor i surtim, doncs no té sentit seguir iterant
            if (/^h/i.test(clau)) {
                nivell = valor;
                break;
            }
        }
        // Emplenem la fila, i si després de tota la iteració la variable nivell segueix buida, entenem que és un nivell desconegut o que directament no l'han guardat
        $('tbody').append(`
            <tr>
                <td>${fila.data.split('T')[0]}</td>
                <td>${fila.municipi}</td>
                <td>${fila.tipus_estacio}</td>
                <td>${fila.area_urbana}</td>
                <td>${fila.contaminant}</td>
                <td>${nivell ?? 'Nivell desconegut'} ${fila.unitats}</td>
                <td>${fila.nom_comarca}</td>
                <td>${fila.codi_ine}</td>
            </tr>
        `);
        // I marquem el punt al mapa segons es va emplenant la taula
        marcarPunt(parseFloat(fila.latitud), parseFloat(fila.longitud), fila.nom_estacio, fila.contaminant, nivell, fila.unitats);
    });
}


// Crear mapa Google Maps
function crearMapa() {
    gMaps = new google.maps.Map(
        document.getElementById('mapa'),    // Element on dibuixar el mapa
        {
            center: {lat: 41.82, lng: 1.7},    // Latitut i longitut del centre del mapa
            zoom: 8                            // Ampliació
        });
}

// Crear marcador de Google Maps
function crearMarcador(latitut, longitut, text) {
    return new google.maps.Marker(
        {
            position: {lat: latitut, lng: longitut},    // Latitut i longitut
            title: text                                 // Text del "tooltip"
        });
}

// Posar el marcador de l'institut en el mapa
function marcarPunt(lat, long, nom_estacio, molecula, nivell, unitat) {

    let gMark;
    // Crear marcador
    gMark = crearMarcador(lat, long, `${nom_estacio}\n${molecula} ${nivell} ${unitat}`);
    // Situar-lo en el mapa
    gMark.setMap(gMaps);
}