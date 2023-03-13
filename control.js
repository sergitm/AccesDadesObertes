"use strict";

function init(){
    $('#consulta').on('click', consulta);
    $('#dataFutura').hide();
    $('#simbols').hide();
}

function consulta(){
    let data = $('#data').val();
    let municipi = $('#municipi').val();
    let tipus = $('#tipus').val();
    console.log(data, municipi, tipus);

    if(!validacioDades(data, municipi)){
        
        let dades = {
            "$select" : "data,municipi,tipus_estacio,area_urbana,contaminant,h01,unitats,latitud,longitud,nom_comarca,codi_ine",
            "$limit" : 100,
            "$$app_token" : "x0fIzm8MqVpAawmYUPekjqYGG"
        };
        
        if (data) {
            dades.data = data;
        }
        if (municipi) {
            dades.municipi = `${municipi[0].toUpperCase()}${municipi.slice(1).toLowerCase()}`;
        }
        if (tipus != '0') {
            dades.tipus_estacio = tipus;
        }
        
        $.ajax({
            url: "https://analisi.transparenciacatalunya.cat/resource/tasf-thgu.json",
            type: "GET",
            data: dades
        }).done(function(data) {
          console.log(data);
          populateTaula(data);
        });
    }
}
            
function validacioDades(data, municipi){
    let dataActual = dataAvui();
    let errors = false;

    if (data) {   
        if (data > dataActual) {
            $('#data').addClass('is-invalid');
            $('#dataFutura').show();
            errors = true;
        } else {
            $('#data').removeClass('is-invalid');
            $('#dataFutura').hide();
            errors = false;
        }
    }
    if (municipi) {    
        if (/^[a-z ]+$/i.test(municipi)) {
            $('#municipi').removeClass('is-invalid');
            $('#simbols').hide();
            errors = false;
        } else {
            $('#municipi').addClass('is-invalid');
            $('#simbols').show();
            errors = true;
        }
    }
    return errors;
}

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
    $('#taulaDades').append(`
        <table class="table"> 
            <thead>
                <tr>
                    <th scope="col">Data</th>
                    <th scope="col">Municipi</th>
                    <th scope="col">Tipus d'estació</th>
                    <th scope="col">Area Urbana</th>
                    <th scope="col">Contaminant</th>
                    <th scope="col">Nivell</th>
                    <th scope="col">Nom de la Comarca</th>
                    <th scope="col">Codi Postal</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    `);

    dades.forEach(fila => {
        $('tbody').append(`
            <tr>
                <td>${fila.data.split('T')[0]}</td>
                <td>${fila.municipi}</td>
                <td>${fila.tipus_estacio}</td>
                <td>${fila.area_urbana}</td>
                <td>${fila.contaminant}</td>
                <td>${fila.h01} ${fila.unitats}</td>
                <td>${fila.nom_comarca}</td>
                <td>${fila.codi_ine}</td>
            </tr>
        `);
    });
}