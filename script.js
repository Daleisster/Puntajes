

import { db, ref, set, onValue } from "./firebase.js"
/*/ Declarar variables, objetos y weaitas /*/
//definir el objeto "Puntajes" con las patrullas y "Eventos"
let Puntajes = {
    Cuervo: 0,
    Caracal: 0,
    Mapache: 0
    }
let Eventos = {}
let EventoSeleccionado = null
let EventoEdit = null
let CargandoFirebase = true
let EventosCargados = false

onValue(ref(db, "puntajes"), (snapshot) => {
    let datos = snapshot.val()
    if (datos) {
        Puntajes = datos
        for (let p in Puntajes) {
            let txt = document.getElementById("Puntaje_"+p)
            if (txt) {
                txt.textContent = p + ": " + Puntajes[p]
            }
        }
    }
    CargandoFirebase = false
})

onValue(ref(db, "eventos"), (snapshot) => {
    let datos = snapshot.val()

    Eventos = datos || {}

    actualizar_eventos()

    EventosCargados = true
})

//ver si es que hay datos guardados y cargarlos en caso de que los haya.
//let savepts = localStorage.getItem("pts")
//if (savepts) {Puntajes=JSON.parse(savepts)}
//let saveevent = localStorage.getItem("events")
//if (saveevent) {Eventos=JSON.parse(saveevent)}


/*/ Pantallas, navegación y esas weaitas/*/
//definiendo las distintas pantallas y botones de navegacion
let homesc  =document.getElementById("homescreen")
let pointsc =document.getElementById("pointscreen")
let eventsc =document.getElementById("eventscreen")
let botonpoints = document.getElementById("gotopoints")
let botonevents = document.getElementById("gotoevents")
let botonhome1 =document.getElementById("homefrompoints")
let botonhome2 =document.getElementById("homefromevents")
botonpoints.onclick = function(){
    homesc.hidden=true
    pointsc.hidden=false
    eventsc.hidden=true
}
botonevents.onclick = function(){
    homesc.hidden=true
    pointsc.hidden=true
    eventsc.hidden=false
}
botonhome1.onclick = function(){
    homesc.hidden=false
    pointsc.hidden=true
    eventsc.hidden=true
}
botonhome2.onclick = function(){
    homesc.hidden=false
    pointsc.hidden=true
    eventsc.hidden=true
}


/*/ Funciones para actualizar la página/*/
//función para actualizar el puntaje de una patrulla en pantalla y en la memoria local
function actualizar_puntaje (patrulla) {
    let txt = document.getElementById("Puntaje_"+patrulla)
    txt.textContent = patrulla+": "+Puntajes[patrulla]

    localStorage.setItem("pts",JSON.stringify(Puntajes))

    if (!CargandoFirebase) {
        set(ref(db, "puntajes"), Puntajes)
    }
}

// funcion para actualizar los eventos en pantalla y memoria local
function actualizar_eventos () {
    let eventlist = document.getElementById("listaeventos")
    let html=""
    for (let e in Eventos) {

        if (Eventos[e].Aplicado) {
            html += '<div class="evento aplicado">'
            html += "<h2>"+e+" ~ Aplicado ✓"+"</h2>"
            html += "<p>1° "+Eventos[e].Puntajes.primero+" pts ||| 2° "+Eventos[e].Puntajes.segundo+" pts ||| 3° "+Eventos[e].Puntajes.tercero+" pts</p>"
            for (let lugar in Eventos[e].Resultado)
                if (lugar==="primero") {html += "<p>1° "+Eventos[e].Resultado.primero.join(" y ")+"</p>"}
                if (lugar==="segundo") {html += "<p>2° "+Eventos[e].Resultado.segundo.join(" y ")+"</p>"}
                if (lugar==="tercero") {html += "<p>3° "+Eventos[e].Resultado.tercero.join(" y ")+"</p>"}
            html += '</div><br><br>'
        }

        else {
            html += '<div class="evento pendiente">'
            html += "<h2>"+e+" ~ Pendiente"+"</h2>"
            html += "<p>1° "+Eventos[e].Puntajes.primero+" pts ||| 2° "+Eventos[e].Puntajes.segundo+" pts ||| 3° "+Eventos[e].Puntajes.tercero+" pts</p>"
            html +='<button class="btn-asignar" data-evento="'+e+'">Asignar</button>'
            html +='<button class="btn-modificar" data-evento="'+e+'">Modificar</button>'
            html +='<button class="btn-eliminar" data-evento="'+e+'">Eliminar</button>'
            html += '</div><br><br>'
        }
    }
    eventlist.innerHTML = html + "<br>"
    
    localStorage.setItem("events",JSON.stringify(Eventos))
    if (EventosCargados) {
        set(ref(db, "eventos"), Eventos)
    }
}

document.getElementById("listaeventos").addEventListener("click", function(event) {
    if (event.target.tagName === "BUTTON") {
        let nombreDelEvento = event.target.getAttribute("data-evento")
        if (event.target.classList.contains("btn-asignar")) {
            mostrar_asignacion(nombreDelEvento)
        }
        if (event.target.classList.contains("btn-modificar")) {
            modificar_evento(nombreDelEvento)
        }
        if (event.target.classList.contains("btn-eliminar")) {
            eliminar_evento(nombreDelEvento)
        }
    }
})

//mostrar la pantalla para asignar un evento
function mostrar_asignacion (ev) {
    EventoSeleccionado=ev
    document.getElementById("asignadorEventos").hidden=false
    document.getElementById("creadorEventos").hidden=true
    document.getElementById("eventoAsignando").textContent = "Asignando: "+ ev
}

//mostrar la pantalla para modificar un evento existente
function modificar_evento (ev) {
    EventoEdit = ev
    document.getElementById("nuevoNombre").value = ev
    document.getElementById("nuevoPrimero").value = Eventos[ev].Puntajes.primero
    document.getElementById("nuevoSegundo").value = Eventos[ev].Puntajes.segundo
    document.getElementById("nuevoTercero").value = Eventos[ev].Puntajes.tercero
    document.getElementById("crearEvento").textContent = "Guardar cambios"
    document.getElementById("CancelarMod").hidden = false
}

//eliminar un evento existente
function eliminar_evento (ev) {
    let confirmacao = confirm("seguro/a que quieres eliminar "+ev+"?")
    if (!confirmacao) {return}
    delete Eventos[ev]
    actualizar_eventos()
}


/*/ Funciones que modifican los puntos de las patrullas/*/
//funcion para asignar puntajes de un evento
function asignar_puntaje (evento) {
    if (Eventos[evento].Aplicado) {
        alert("Evento ya asignado") 
        return
    }
    let posiciones = {
        primero:[],
        segundo:[],
        tercero:[]
    }
    let cro = document.getElementById("selCuervo").value
    let flo = document.getElementById("selCaracal").value
    let rac = document.getElementById("selMapache").value
    let x = 0

    if (!cro || cro === "Seleccionar posición"){x+=1}
    if (!flo || flo === "Seleccionar posición"){x+=1}
    if (!rac || rac === "Seleccionar posición"){x+=1}
    if (x > 0) {
        alert("Por favor asigna los lugares a todas las patrullas") 
        return
    }

    posiciones[cro].push("Cuervo")
    posiciones[flo].push("Caracal")
    posiciones[rac].push("Mapache")

    let l1 = posiciones.primero.length
    let l2 = posiciones.segundo.length
    let l3 = posiciones.tercero.length
    let primero
    let tercero
    let empatados

    if (l1 === 1 && l2 === 1 && l3 === 1) { //no empates
        Puntajes.Cuervo  += Eventos[evento].Puntajes[cro]
        Puntajes.Caracal += Eventos[evento].Puntajes[flo]
        Puntajes.Mapache += Eventos[evento].Puntajes[rac]   
        Eventos[evento].Resultado = {
            primero: posiciones.primero,
            segundo: posiciones.segundo,
            tercero: posiciones.tercero
        }    
    }

    else if (l1 === 2 || (l2 === 2 && l3 === 1)) { //empate por primera posición y tercer lugar normal
        let promedio = (Eventos[evento].Puntajes.primero + Eventos[evento].Puntajes.segundo)/2
        if (l3===1){tercero = posiciones.tercero}
        else if (l2===1){tercero = posiciones.segundo}
        if (l2===2){empatados = posiciones.segundo}
        else if (l1===2) {empatados = posiciones.primero}
        for (let e of empatados) {Puntajes[e] += (Math.round(promedio))}
        for (let t of tercero) {Puntajes[t] += Eventos[evento].Puntajes.tercero}
        Eventos[evento].Resultado = {
            primero: empatados,
            tercero: tercero
        }
    }

    else if ((l1 === 1 && l2 === 2) || l3 === 2){ //primera posición normal empate por segundo
        let promedio = (Eventos[evento].Puntajes.segundo + Eventos[evento].Puntajes.tercero)/2
        if (l1===1){primero = posiciones.primero}
        else if (l2===1){primero = posiciones.segundo}
        if (l2===2){empatados = posiciones.segundo}
        else if (l3===2) {empatados = posiciones.tercero}
        for (let e of empatados) {Puntajes[e] += (Math.round(promedio))}
        for (let t of primero) {Puntajes[t] += Eventos[evento].Puntajes.primero}
        Eventos[evento].Resultado = {
            primero: primero,
            segundo: empatados
        }
    }

    else if (l1 === 3 || l2===3 || l3===3) { //triple empate
        let promedio = (Eventos[evento].Puntajes.primero +Eventos[evento].Puntajes.segundo + Eventos[evento].Puntajes.tercero)/3
        if (l1===3) {empatados=posiciones.primero}
        else if (l2===3) {empatados=posiciones.segundo}
        else if (l3===3) {empatados=posiciones.tercero}
        Puntajes.Cuervo  += (Math.round(promedio))
        Puntajes.Caracal += (Math.round(promedio))
        Puntajes.Mapache += (Math.round(promedio))
        Eventos[evento].Resultado = {
            primero: empatados
        }
    }
    
    else {
        alert("Configuración inválida")
        return
    }

    for (let p in Puntajes) {actualizar_puntaje(p)}
    Eventos[evento].Aplicado=true
    actualizar_eventos()
}
//boton para asignar puntaje que llama a la funcion para asignar el puntaje
let botonAplicar = document.getElementById("commitevento")
botonAplicar.onclick = function() {
    asignar_puntaje(EventoSeleccionado)
    document.getElementById("asignadorEventos").hidden=true
    document.getElementById("creadorEventos").hidden=false
    document.getElementById("selCuervo").selectedIndex = 0
    document.getElementById("selCaracal").selectedIndex = 0
    document.getElementById("selMapache").selectedIndex = 0
}
let botonCancelar = document.getElementById("cancelAsign")
botonCancelar.onclick = function() {
    document.getElementById("asignadorEventos").hidden=true
    document.getElementById("creadorEventos").hidden=false
}
let botonCancelarMod = document.getElementById("CancelarMod")
botonCancelarMod.onclick = function(){
    EventoEdit = null
    document.getElementById("crearEvento").textContent = "Crear el evento"
    document.getElementById("nuevoNombre").value = ""
    document.getElementById("nuevoPrimero").value = ""
    document.getElementById("nuevoSegundo").value = ""
    document.getElementById("nuevoTercero").value = ""
    document.getElementById("CancelarMod").hidden = true
    actualizar_eventos()
    
}

//botones para sumar y restar puntos a patrullas
for (let p in Puntajes) {
    actualizar_puntaje(p)
    let botonplus10 = document.getElementById("plus10"+p)
    let botonplus50 = document.getElementById("plus50"+p)
    let botonplus100 = document.getElementById("plus100"+p)
    let botonminus10 = document.getElementById("dcto10"+p)
    let botonminus50 = document.getElementById("dcto50"+p)
    let botonminus100 = document.getElementById("dcto100"+p)
    botonplus10.onclick = function() {
        Puntajes[p] += 10
        actualizar_puntaje(p)
    }
    botonplus50.onclick = function() {
        Puntajes[p] += 50
        actualizar_puntaje(p)
    }
    botonplus100.onclick = function() {
        Puntajes[p] += 100
        actualizar_puntaje(p)
    }
    botonminus10.onclick = function() {
        Puntajes[p] -= 10
        actualizar_puntaje(p)
    }
    botonminus50.onclick = function() {
        Puntajes[p] -= 50
        actualizar_puntaje(p)
    }
    botonminus100.onclick = function() {
        Puntajes[p] -= 100
        actualizar_puntaje(p)
    }
}
//botón pa resetear los puntajes y desasignar los eventos
let boton_reset = document.getElementById("resetPTS")
boton_reset.onclick = function() {
    if (!confirm("¿Seguro que deseas reiniciar todos los puntajes y asignaciones de eventos?")){
        return
    }
    for (let p in Puntajes) {
        Puntajes[p] = 0
        actualizar_puntaje(p)
    }
    for (let e in Eventos) {
        Eventos[e].Aplicado=false
        Eventos[e].Resultado=null
    }
    actualizar_eventos()
}


/*/ Modificación de eventos/*/
//boton para crear eventos nuevos
let botonCrear = document.getElementById("crearEvento")
botonCrear.onclick = function(){
    if (EventoEdit) {
        let nombre = document.getElementById("nuevoNombre").value.trim()
        nombre = nombre.toUpperCase()
        let primero = Number(document.getElementById("nuevoPrimero").value)
        let segundo = Number(document.getElementById("nuevoSegundo").value)
        let tercero = Number(document.getElementById("nuevoTercero").value)

        if (nombre === "") {
            alert("nombre inválido")
            return
        }

        if (nombre !== EventoEdit && Eventos[nombre]) {
            alert("ya existe ese evento")
            return
        }

        delete Eventos[EventoEdit]

        Eventos[nombre] = {
            Puntajes:{
                primero: primero,
                segundo: segundo,
                tercero: tercero
            },
            Aplicado:false,
            Resultado:null
        }

        EventoEdit = null

        document.getElementById("crearEvento").textContent = "Crear el evento"

        document.getElementById("nuevoNombre").value = ""
        document.getElementById("nuevoPrimero").value = ""
        document.getElementById("nuevoSegundo").value = ""
        document.getElementById("nuevoTercero").value = ""
        document.getElementById("CancelarMod").hidden = true

        actualizar_eventos()
        return
    }

    let nombre = document.getElementById("nuevoNombre").value.trim()
    nombre = nombre.toUpperCase()
    let primero = Number(document.getElementById("nuevoPrimero").value)
    let segundo = Number(document.getElementById("nuevoSegundo").value)
    let tercero = Number(document.getElementById("nuevoTercero").value)
    if (Eventos[nombre] || nombre === "") {
        alert("nombre de evento inválido")
        return
    }
    if (isNaN(primero) || isNaN(segundo) || isNaN(tercero)) {
        alert("Puntajes deben ser números")
        return
    }


    Eventos[nombre] = {
        Puntajes:{
            primero: primero,
            segundo: segundo,
            tercero: tercero
        },
        Aplicado:false,
        Resultado:null
    }
    document.getElementById("nuevoNombre").value = ""
    document.getElementById("nuevoPrimero").value = ""
    document.getElementById("nuevoSegundo").value = ""
    document.getElementById("nuevoTercero").value = ""
    actualizar_eventos()
}


/*/Ejecuar la página/*/
actualizar_eventos()

