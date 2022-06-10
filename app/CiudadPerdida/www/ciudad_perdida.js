// La ciudad perdida (c) Baltasar 2022 MIT License <baltasarq@gmail.com>
/*
    generado por FI.JS@txtMap, v0.1/ v0.6 20140612
    Thu May 12 18:56:50 2022
*/


ctrl.setTitle( "La ciudad perdida" );
ctrl.setPic( "res/portada.jpg" );
ctrl.setAuthor( "baltasarq@gmail.com" );
ctrl.setVersion( "0.1 20220509" );
ctrl.setIntro( "<p>Episodio 1<br/>\
                   Recibes la llamada de la hija de un explorador \
                   del siglo pasado para recuperar las pistas dejadas \
                   por él y poder encontrar \
                   la ciudad perdida de Chactun.</p>" );


// ================================================================== Locs
// The part of the map.
Loc.MapPartGeneral = 100;
Loc.MapPartCenote  = 101;
Loc.MapPartPyramid = 102;

// ---------------------------------------------------------------- locAcuifero
const locAcuifero = ctrl.places.creaLoc(
    "Acuífero",
    [ "acuifero" ],
    "Un ${río, ex rio} subterráneo \
     corre de ${este, este} a ${oeste, oeste}. Un estrecho túnel permite el paso \
     hacia el ${norte, norte}."
);

locAcuifero.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = false;
};

const objRio = ctrl.creaObj(
    "rio",
    [ "rio" ],
    "El agua circula con fuerza hacia el ${oeste, oeste}, \
	 hacia donde la caverna, sin arcos, marcos o adornos de ningún tipo, \
     se estrecha dejando apenas paso para el agua \
     y una pequeña ${senda, ex senda}.",
    locAcuifero,
    Ent.Scenery
);

const objSenda = ctrl.creaObj(
    "senda",
    [ "senda" ],
    "La superficie de la cueva es altamente irregular, \
     y hacia el ${este, e} parece convertirse en una pequeña gruta \
     en la que apenas queda espacio para cruzar.",
    locAcuifero,
    Ent.Scenery
);


// ---------------------------------------------------------------- locAlmacen
const locAlmacen = ctrl.places.creaLoc(
    "Almacén",
    [ "almacen" ],
    "Contra los muros de esta sala se apilan \
     diferentes ${útiles y materiales, ex materiales}, \
     dejando libres nuevos accesos \
     al ${norte, norte}, ${sur, sur}, ${este, este} y ${oeste, oeste}."
);

locAlmacen.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = true;
    this.setExit( "norte", locCruceDePasajes );
};

const objMateriales = ctrl.creaObj(
    "material",
    [ "util", "utiles", "materiales" ],
    "Diferentes materiales de madera y piedra de todo tipo, \
     aunque de la mayoría no puedas adivinar su significado. \
     Sí que reconoces varias ${antorchas, ex antorchas}.",
    locAlmacen,
    Ent.Scenery
);

const objAntorchas = ctrl.creaObj(
    "antorchas",
    [ "teas" ],
    "Muchas antorchas, aunque el tiempo las ha secado en exceso, \
     de manera que cualquiera de ellas durará un tiempo limitado.",
    locAlmacen,
    Ent.Scenery
);

objAntorchas.preExamine = function() {
    let toret = this.desc;

    if ( ctrl.places.limbo.has( objAntorcha ) ) {
        toret += " Podrías ${coger una antorcha, coge antorcha} para reemplazar la tuya.";
    }

    return toret;
};

objAntorchas.preTake = function() {
    let toret = "¿Para qué? Tu antorcha aún sirve.";

    if ( ctrl.places.limbo.has( objAntorcha ) ) {
        toret = "Tomas otra antorcha de las muchas aquí.";
        objAntorcha.moveTo( ctrl.personas.getPlayer()  );
        objAntorcha.light();
    }

    return toret;
};

const objAntorcha = ctrl.creaObj(
    "antorcha",
    [ "tea", "luz", "fuego", "lumbre" ],
    "A estas alturas, está más seca que otra cosa, con el combustible \
     ya casi agotado, haciendo que su duración sea limitada.",
    ctrl.places.limbo,
    Ent.Portable
);

objAntorcha.preExamine = function() {
    let toret = this.desc;

    if ( this.isLit ) {
        toret += " Todavía arde.";
    } else {
        toret += " Está apagada.";
    }

    return toret;
};

objAntorcha.ini = function() {
    this.moveTo( locCueva );
    this.MAX_LIFE = 10;
    this.isLit = false;
    this.bikiniEncendedorDicho = false;
};

objAntorcha.light = function() {
    const player = ctrl.personas.getPlayer();
    const pnjLaura = ctrl.personas.getPersonaById( "Laura" );
    let toret = "La tea arde ágil y con mucha luz.";

    if ( !ctrl.isPresent( objAntorcha ) ) {
        return "No la tienes a mano...";
    }

    player.say( "Querría encender la antorcha..." );

    if ( this.isLit ) {
        ctrl.print( "Laura te mira socarrona..." );
        pnjLaura.say( "¿Para qué, vaquero? No se ha apagado..." );
        toret = "¡La antorcha está ya ardiendo!";
    } else {
        this.isLit = true;
        this.turnsWhenLit = ctrl.getTurns();

        ctrl.print( "De algún lugar, Laura saca un encendedor \
                     y prende la tea." );
        pnjLaura.say( "¡Fantástico, ahora tenemos luz!" );


        if ( !this.bikiniEncendedorDicho ) {
            this.bikiniEncendedorDicho = true;
            ctrl.print( "Miras hacia la antorcha durante unos tensos segundos, \
                        consciente de que Laura se estará guardando \
                        otra vez el mechero en alguna parte de su reducido bikini... \
                        y sientes sentimientos encontrados sobre mirar o no. \
                        Finalmente, decides no hacerlo." );
        } else {
            ctrl.print( "Disimulas mientras te preguntas de nuevo dónde guardará \
                         el encendedor... intentas sacudir estas preguntas fuera \
                         de tu mente." );
        }

        ctrl.addDaemon( "Antorcha::porCadaTurno", function() {
            const life = objAntorcha.MAX_LIFE
                            - ( ctrl.getTurns() - objAntorcha.turnsWhenLit );
            let toret = "";

            if ( life < 1 ) {
                toret = "La antorcha se ha apagado... la descartas antes \
                        de que las chispas te quemen... ¡estás a oscuras!";
                objAntorcha.isLit = false;
                ctrl.removeDaemon( "Antorcha::porCadaTurno" );
                objAntorcha.moveTo( ctrl.places.limbo );
            }
            else
            if ( life <= 5 ) {
                toret = "Los contínuos chisporroteos en la antorcha \
                        te indican que su final está cerca... \
                        ¡necesitas otra!";
            }
            else
            if ( life <= 8 ) {
                toret = "La antorcha empieza a dar signos \
                        de agotamiento... Pequeños chisporroteos te \
                        indican que el propio material se consume ya, \
                        y se apagará en breve.";
            }

            if ( ctrl.isPresent( objAntorcha ) ) {
                ctrl.print( toret );
            }
        });
    }

    return toret;
};

objAntorcha.preDrop = function() {
    this.isLit = false;
    ctrl.removeDaemon( "Antorcha::porCadaTurno" );
    this.moveTo( ctrl.places.limbo );

    return "La antorcha se apaga entre pequeños chispazos \
            al caer al suelo.";
};

objAntorcha.preStart = function() {
    return this.light();
};


// ---------------------------------------------------------------- locBalcon
const locBalcon = ctrl.places.creaLoc(
    "Balcón",
    [ "balcon" ],
    "Aún pareciendo en un principio un pasaje estrecho, \
     la sala se abre desde el ${norte, n} al ${sur, sur} dejando ver \
     una gran ${sima, ex sima}, de una profundidad tan grande \
     que resulta imposible ver el fondo."
);

locBalcon.timesSouth = 0;

locBalcon.ini = function() {
    this.pic = "res/balcon.jpg";
    this.light = false;
    this.mapPart = Loc.MapPartCenote;
};

locBalcon.preGo = function() {
    const goAction = actions.getAction( "go" );
    const sentence = parser.sentence;
    let toret = "";

    if ( sentence.term1 == "sur" ) {
        const pnjLaura = ctrl.personas.getPersonaById( "Laura" );

        ++this.timesSouth;

        if ( this.timesSouth < 5 ) {
            ctrl.print( "Laura se abalanza sobre ti y te sujeta fuertemente." );
            pnjLaura.say( "¡¡¿¿Pero estás loco??!! ¿A dónde crees que vas?" );
            toret = "Laura ha impedido que te despeñaras por el balcón."
        } else {
            ctrl.print( "Laura te mira con lástima." );
            pnjLaura.say( "Está bien, si es eso lo que quieres..." );
            ctrl.print( "Saltas al vacío." );
            endGame( "<p>Laura intenta agarrarte de nuevo, pero \
                           de repente su abrazo se vuelve débil \
                           y te deja ir.</p> \
                           <p>Ella te mira con lástima, meneando \
                           la cabeza de un lado a otro.</p> \
                           <p>Finalmente dice: \"Está bien, si \
                           eso es lo que quieres....\"</p> \
                           <p>Crees ver sus ojos húmedos.</p> \
                           <p>Y entonces, saltas al vacío...</p>",
                           "res/balcon.jpg"
            );
        }
    } else {
        toret = goAction.exe( sentence );
    }

    return toret;
};

const objSimaBalcon = ctrl.creaObj(
    "sima",
    [ "sima", "abismo" ],
    "El fondo abisal se abre a tus pies. Dicen que no puedes mirar \
     al abismo sin que el abismo te devuelve la mirada... \
     ¿Por qué de repente te entran tantas ganas de ${saltar, sur}?",
    locBalcon,
    Ent.Scenery
);


// ----------------------------------------------------------- locBordeCenote
const locBordeDelCenote = ctrl.places.creaLoc(
    "Borde del cenote",
    [ "borde del cenote" ],
    "${Agua tranquila y cristalina, ex agua}, \
     de un azul nacarado llena el pozo. \
     En el borde más alejado, \
     puedes oir cómo el mar invisible contra la costa rocosa, \
     el único lugar donde se aprecia cierto movimiento. \
     Unas ${escaleras de antigua piedra, ex escaleras} \
     al ${norte, n} dan a entender que hay algo más \
     en este maravilloso lugar."
);

locBordeDelCenote.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = true;
    this.pic = "res/cenote_borde.jpg";
};

const objAguas = ctrl.creaObj(
    "aguas",
    [ "aguas", "agua" ],
    "Aún sabiendo que es salobre, dan ganas de bebérsela.",
    locBordeDelCenote,
    Ent.Scenery
);

const objEscaleras = ctrl.creaObj(
    "escaleras",
    [ "escaleras" ],
    "La piedra aparece desbastada y cubierta parcialmente \
     de hojarasca y flora.",
    locBordeDelCenote,
    Ent.Scenery
);


// ---------------------------------------------------------------- locCruce
const locCruceDePasajes = ctrl.places.creaLoc(
    "Cruce de pasajes",
    [ "cruce de pasajes" ],
    "En esta pequeña sala pueden encontrarse ${túneles, ex tuneles} \
     que permiten moverse al ${norte, norte}, ${sur, sur}, ${este, este} \
     y ${oeste, oeste}."
);

locCruceDePasajes.ini = function() {
    this.mapPart = Loc.PartMapCenote;
    this.light = false;

    this.setExitBi( "norte", locAlmacen );
    this.setExitBi( "oeste", locAlmacen );
    this.setExit( "sur", locFalla );
    this.setExit( "este", locGranSala );
}

const objTuneles = ctrl.creaObj(
    "tuneles",
    [ "tuneles" ],
    "Los túneles permiten avanzar en todas direcciones: \
     ${norte, norte}, ${sur, sur}, ${este, este} y ${oeste, oeste}.",
    locCruceDePasajes,
    Ent.Scenery
);


// ---------------------------------------------------------------- locCueva
const locCueva = ctrl.places.creaLoc(
    "Cueva",
    [ "cueva" ],
    "La ${cueva, ex paredes} contiene una piscina natural de ${agua, ex agua} \
     de la que asciende una ${rampa, ex rampa} de piedra para culminar \
     en un ${rellano, ex rellano} y un ${adornado dintel, ex dintel} \
     sobre un pasaje al ${este, este}. \
     Aquí también hay restos de ${maderos, ex maderos}."
);

locCueva.ini = function()
{
    this.pic = "res/dintel.jpg";
    this.light = true;
    this.mapPart = Loc.MapPartCenote;
    this.setExitBi( "este", locSalaRecibidor );
    this.objs.push( objMaderos );
}

locCueva.preGo = function() {
    const sentence = parser.sentence;
    let toret = "";

    if ( sentence.term1 == "arriba" ) {
        toret = "Tras bucear camino de la superficie, \
                 de nuevo al límite de capacidad, observaste \
                 embobado cómo Laura se vestía de nuevo. ";
        objPrendasLaura.moveTo( ctrl.places.limbo );
        ctrl.goto( locPlataforma );
    } else {
        const goAction = actions.getAction( "go" );

        toret = goAction.exe( parser.sentence );
    }

    return toret;
};

const objParedesCueva = ctrl.creaObj(
    "pared",
    [ "paredes", "muros", "fosforescencia" ],
    "Las paredes de la cueva emiten luz mediante algún tipo de \
     fosforescencia que desconoces. Así, pequeñas motas brillantes \
     perlan los muros, iluminando el lugar. ",
     locCueva,
     Ent.Scenery
);

const objRampa = ctrl.creaObj(
    "rampa",
    [ "rampa" ],
    "De piedras que notas suaves al tacto, \
     probablemente por la cantidad de pequeñas algas \
     que alfombran su superficie, \
     lo que los hace bastante resbaladizos.",
    locCueva,
    Ent.Scenery
);

const objAguaCueva = ctrl.creaObj(
    "agua",
    [ "aguas" ],
    "La poca luminosidad no permite apreciar nada especial en el agua \
     que se antoja totalmente oscura. Podrías volver a \
     ${bucear, sube} para volver a ascender a la superficie.",
    locCueva,
    Ent.Scenery
);

const objRellano = ctrl.creaObj(
    "rellano",
    [ "rellano" ],
    "Se encuentra razonablemente limpio y seco.",
    locCueva,
    Ent.Scenery
);

const objDintel = ctrl.creaObj(
    "dintel",
    [ "dintel" ],
    "Aprovechando un pasaje en la cueva, \
     se ha construído un marco alrededor, \
     orlado con distintos motivos solares.",
    locCueva,
    Ent.Scenery
);


// ---------------------------------------------------------------- locGranSala
const locGranSala = ctrl.places.creaLoc(
    "Gran sala",
    [ "gran sala" ],
    "Esta gran caverna no cuenta con ningún tipo de decoración, \
     excepto en los ${accesos, ex accesos} hacia \
     el ${norte, norte}, ${sur, sur}, ${este, este}, ${oeste, oeste} \
     y ${sur, sur}."
);

locGranSala.ini = function() {
    this.mapPart = Loc.PartMapCenote;
    this.light = false;

    this.setExit( "norte", locAlmacen );
    this.setExitBi( "sur", locBalcon );
    this.setExitBi( "este", locAlmacen );
    this.setExit( "oeste", locCruceDePasajes );
};

const objAccesos = ctrl.creaObj(
    "accesos",
    [ "accesos" ],
    "Los accesos están decorados con glifos de todo tipo, \
     en los que sigue teniendo un gran protagonismo el sol.",
    locGranSala,
    Ent.Scenery
);


// ---------------------------------------------------------------- locFalla
const locFalla = ctrl.places.creaLoc(
    "Falla",
    [],
    "Una gran ${falla, ex sima} atraviesa la caverna de este a oeste. \
     Un enorme ${puente de piedra, ex puente} permite cruzarla, \
     mientras ${sur, sur} se encuentra un pequeño pasadizo."
);

locFalla.preExamine = function() {
    let toret = locFalla.desc;

    if ( this.getTimesExamined() <= 1 ) {
        toret += " Parece que la falla es la que en algún momento \
                  provocó la grieta que se abrió a través de la gran \
                  sala al ${sur, sur}.";
    }

    return toret;
};

locFalla.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = false;

    this.setExit( "norte", locCruceDePasajes );
    this.setExit( "sur", locPasajeAgrietado );
};

const objPuente = ctrl.creaObj(
    "puente",
    [ "puente" ],
    "Dos contrafuertes se alzan desde sendos bordes de la falla, \
     y se unen en su parte superior en una suerte de rampa. \
     La subida y bajada resulta abrupta, pero definitivamente posible. \
     Por el puente se puede acceder al ${norte, norte}.",
    locFalla,
    Ent.Scenery
);

const objSima = ctrl.creaObj(
    "sima",
    [ "abismo", "caida", "precipicio" ],
    "Una gran altura hasta un acuífero que ruge por entre las rocas.",
    locFalla,
    Ent.Scenery
);


// ------------------------------------------------------- locPasajeAgrietado
const locPasajeAgrietado = ctrl.places.creaLoc(
    "Pasaje agrietado",
    [ "pasaje agrietado" ],
    "El pasaje de ${norte, norte} a ${sur, sur} \
     parece un antiguo túnel, distinto al de las grandes salas al ${sur, sur}, \
     del que se ha desprendido el techo del que solo quedan ${escombros, ex escombros}. \
     Así, la forma es de un bajo pasillo con forma triangular."
);

locPasajeAgrietado.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = false;
    this.setExitBi( "norte", locFalla );
};

const objEscombros = ctrl.creaObj(
    "escombros",
    [ "escombros", "escombro", "restos" ],
    "Los restos del techo yacen esparcidos por el suelo, \
     en forma de trozos de ${piedras labradas, ex piedras}.",
    locPasajeAgrietado,
    Ent.Scenery
);

const objPiedras = ctrl.creaObj(
    "piedras",
    [ "piedras" ],
    "Algunas de las piedras más grandes se han desecho en ${trozos \
     más pequeños, coge piedras}.",
    locPasajeAgrietado,
    Ent.Scenery
);

objPiedras.preTake = function() {
    const player = ctrl.personas.getPlayer();
    let toret = "Son todas piedras muy grandes sin ningún interés.";

    if ( ctrl.places.limbo.has( objPiedra ) ) {
        objPiedra.moveTo( player );
        toret = "Coges una piedra de entre los escombros.";
    }

    return toret;
};

const objPiedra = ctrl.creaObj(
    "piedra",
    [ "trozo" ],
    "Pues sí, es una piedra. Del tamaño de tu puño, para más señas.",
    ctrl.places.limbo,
    Ent.Portable
);


// ------------------------------------------------------------ locPlataforma
const locPlataforma = ctrl.places.creaLoc(
    "Plataforma",
    [ "plataforma" ],
    "Las escaleras ${ascienden, o} desde el borde del ${agua, ex agua}, \
     donde un rellano más ancho de lo habitual \
     crea una plataforma de piedra. Algunos ${maderos, ex maderos} \
     aparecen esparcidos por la plataforma."
);

locPlataforma.ini = function() {
    this.pathShown = false;
    this.light = true;
    this.mapPart = Loc.MapPartCenote;
    this.pic = "res/cenote_plataforma.jpg";
};

locPlataforma.preGo = function() {
    const sentence = parser.sentence;
    const player = ctrl.personas.getPlayer();
    const pnjLaura = ctrl.personas.getPersonaById( "Laura" );
    let toret = "";

    if ( sentence.term1 == "abajo" ) {
        if ( player.objs.length == 0 ) {
            ctrl.print( "Buceaste siguiendo la hilera de salientes. \
                         Cuando estabas a punto de abandonar, \
                         viste una entrada a algún tipo de cueva y \
                         te esforzaste por llegar con tus últimas \
                         fuerzas." );
            ctrl.goto( locCueva );
            pnjLaura.say( "Chico, menos mal que por fin has aparecido..." );
            pnjLaura.startMovingWithPlayer();
            toret = "Terminas de subir la rampa entre las burlas de Laura.";
        } else {
            toret = "Intentas sumergirte y bucear, pero la ropa \
                     te impide la libertad de movimientos.";
        }
    }

    return toret;
};

const objAguaPlataforma = ctrl.creaObj(
    "agua",
    [ "agua" ],
    "Tranquilas, nacaradas y salobres aguas. \
     Aún así, no puedes ver el fondo, \
     solo un oscurecimiento paulatino con la ${profundidad, ex profundidad}.",
    locPlataforma,
    Ent.Scenery
);

const objProfundidades = ctrl.creaObj(
    "profundidades",
    [ "profundidades", "profundidad" ],
    "Desde aquí no aprecias el fondo. \
     En la pared sí que puedes ver salientes de piedra \
     que se suceden como en una hilera que va tomando profundidad \
     en una suave diagonal.",
    locPlataforma,
    Ent.Scenery
);

const objMaderos = ctrl.creaObj(
    "maderos",
    [ "maderos" ],
    "Trozos de madera podridos por la humedad. \
     Parecen indicar que había algún tipo de construcción \
     que permitía comunicar esta plataforma con... \
     ¿algún lugar ${bajo el agua, ex profundidades}?",
    locPlataforma,
    Ent.Scenery
);

const objPrendasLaura = ctrl.creaObj(
    "ropa de laura",
    [ "ropa" ],
    "La ropa que llevaba Laura puesta... por encima del bikini, \
     por lo que parece.",
     ctrl.places.limbo,
     Ent.Scenery
);

objPrendasLaura.preWear =
objPrendasLaura.preOpen =
objPrendasLaura.prePush =
objPrendasLaura.preStart =
objPrendasLaura.preTake = function() {
    const player = ctrl.personas.getPlayer();

    player.think( "¿Y qué voy a conseguir con esto?" );
    return "Deja de pensar en la ropa de Laura...";
};


// ----------------------------------------------------------------- locPresa
const locPresa = ctrl.places.creaLoc(
    "Presa",
    [ "presa" ],
    "Una ${represa, ex represa} se sitúa en mitad de la caverna, \
     aunque gran cantidad de ${agua, ex acuifero} \
     circula hacia el ${oeste, oeste}. \
     Una ${pequeña abertura, ex abertura} permite el paso \
     hacia el ${este, este}."
);

locPresa.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = false;

    this.setExit( "norte", locSalaRecibidor );
    this.setExit( "este", locSalaReducida );
    this.setExit( "oeste", locAcuifero );
    this.setExitBi( "oeste", locAcuifero );
};

const objAbertura = ctrl.creaObj(
    "abertura",
    [ "abertura" ],
    "Tienes que agacharte para poder apreciar \
     que hay camino hacia el ${este, este}. \
     Por algún motivo, te recuerda un túnel de mantenimiento.",
    locPresa,
    Ent.Scenery
);

const objAcuifero = ctrl.creaObj(
    "acuifero",
    [ "acuifero" ],
    "El agua va ganando fuerza hacia el ${este, este}.",
    locPresa,
    Ent.Scenery
);


// ------------------------------------------------------- locRecodoEscaleras
const locRecodoEnLasEscaleras = ctrl.places.creaLoc(
    "Recodo en las escaleras",
    [ "recodo en las escaleras" ],
    "Las escaleras hacen aquí un recodo en ángulo recto, \
     de manera que un tramo ${asciende, sube} hacia el ${sur, sur} \
     y otro ${desciende, baja} hacia el ${este, este}. \
     Los peldaños parecen incrustados en el muro, \
     saliendo de este como travesaños colgados en el aire. \
     Enredaderas y lianas cuelgan del muro y de los bordes \
     de algunos peldaños."
);

locRecodoEnLasEscaleras.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = true;
    this.pic = "res/cenote_recodo_escaleras.jpg";
    this.setExitBi( "sur", locBordeDelCenote );
    this.setExitBi( "arriba", locBordeDelCenote );
    this.setExitBi( "este", locPlataforma );
    this.setExitBi( "abajo", locPlataforma );
};


// ---------------------------------------------------------- locSalaCircular
const locSalaCircular = ctrl.places.creaLoc(
    "Sala circular",
    [ "sala circular" ],
    "Aunque no lo parecía desde el exterior, \
    esta sala tiene una curiosa forma redonda y alargada. \
    Las ${paredes, ex paredes} norte y sur se ensanchan \
    en sendos semicírculos, mientras los extremos ${este, este} \
    y ${oeste, oeste} mantienen su tamaño normal. \
    También hay ${portuberancias, ex portuberancias} \
    en las ${paredes, ex paredes}."
);

locSalaCircular.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = false;

    this.setExitBi( "oeste", locSalaRecibidor );
    this.objs.push( objSoportes );
};

const objParedesCirculares = ctrl.creaObj(
    "paredes circulares",
    [ "paredes" ],
    "Las paredes, como en las otras salas, \
     tienen profusión de simbología solar. \
     Además, hay ${portuberancias, ex portuberancias} \
     en todas ellas a intervalos regulares.",
    locSalaCircular,
    Ent.Scenery
);


// ------------------------------------------------------------- locSalaTrono
const locSalaDelTrono = ctrl.places.creaLoc(
    "Sala del trono",
    [ "sala del trono" ],
    "Un gran espacio rectangular parece terminar en una zona alta \
     y más estrecha que se te antoja para algún tipo de privilegio. \
     De nuevo las ${portuberancias, ex portuberancias} \
     se sitúan en los muros norte y sur, a intervalos regulares. \
     Solo se puede retroceder hacia el ${oeste, oeste}."
);

locSalaDelTrono.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = false;
    this.setExitBi( "oeste", locSalaCircular );
};


// ---------------------------------------------------------- locSalaRecibidor
const locSalaRecibidor = ctrl.places.creaLoc(
    "Sala recibidor",
    [ "sala recibidor" ],
    "Una gran sala de alta ${bóveda, ex boveda} \
     se abre de forma natural en la cueva. \
     Los muros están revestidos de piedra labrada, \
     como si a modo de ${paredes, ex paredes} se trataran. \
     Un pequeño estrechamiento al ${este, este} parece indicar \
     algún tipo de salida, aunque desde aquí parece \
     que sigue la misma sala. Hacia el ${oeste, oeste} se vuelve a la \
     cueva."
);

locSalaRecibidor.ini = function() {
    this.mapPart = Loc.MapPartCenote;
    this.light = false;
    this.pic = "res/sala_recibidor.jpg";

    this.setExitBi( "norte", locPasajeAgrietado );
    this.setExitBi( "sur", locAcuifero );
};

const objBoveda = ctrl.creaObj(
    "boveda",
    [ "boveda" ],
    "La bóveda se cierra un metro por encima de tu cabeza, \
     suficientemente alta como para que se aprecie oscura.",
    locSalaRecibidor,
    Ent.Scenery
);

const objParedes = ctrl.creaObj(
    "paredes",
    [ "pared", "muro", "muros", "paredes" ],
    "No eres un experto en simbología maya, \
     aunque el sol parece ocupar un lugar predominante en todos \
     los grupos de glifos. Además, a intervalos regulares \
     en las paredes norte y sur puedes ver \
     ciertas ${portuberancias de piedra, ex soportes}.",
    locSalaRecibidor,
    Ent.Scenery
);

objParedes.intentosEx = 0;

objParedes.preExamine = function() {
    const pnjLaura = ctrl.personas.getPersonaById( "Laura" );
    let toret = this.desc;

    if ( ctrl.places.limbo.has( objGrieta ) ) {
        ++this.intentosEx;
        pnjLaura.say( "Aquí debe de haber algo..." );
        ctrl.print( "Laura también se centra en las paredes. \
                     Las palpa suavemente con sus manos." );

        if ( this.intentosEx > 2 ) {
            pnjLaura.say( "¡Anda! ¿Te has fijado en esto?" );
            toret = " Sigues las indicaciones de Laura. \
                    Examinando con atención de nuevo los muros, \
                    das con una ${grieta, ex grieta} que no habías \
                    visto antes. "
                    + toret;
            objParedes.desc += " Una ${grieta, ex grieta} recorre la estancia.";
            objGrieta.moveTo( this.owner );
        }
    }

    return toret;
};

const objGrieta = ctrl.creaObj(
    "grieta",
    [ "socavon" ],
    "Una grieta corre de ${norte, norte} a ${sur, sur}, permitiendo \
     el acceso más allá de esta sala. Si en las paredes crea pequeñas \
     aberturas verticales por las que una persona se podría meter, \
     en el suelo en cambio supone solo un ligero desnivel \
     que ni siquiera es necesario salvar.",
    ctrl.places.limbo,
    Ent.Scenery
);

const objSoportes = ctrl.creaObj(
    "soportes",
    [ "soportes" ],
    "Las portuberancias de las paredes norte y sur \
     tienen forma de soportes o bandejas para un líquido oleoso, \
     que puedes ver fluyendo, entrando y saliendo por pequeños orificios. \
     De hecho, puedes escuchar un pequeño rumor en algún lugar \
     al otro lado de la pared. Por otra parte, \
     una número importante de ellas están secas, \
     supones que algo bloquea el flujo del aceite.",
    locSalaRecibidor,
    Ent.Scenery
);


// ----------------------------------------------------------- locSalaReducida
const locSalaReducida = ctrl.places.creaLoc(
    "Sala reducida",
    [ "sala reducida" ],
    "Solo puedes ver cómo el agua desciende por debajo \
     del nivel de la ${pared de piedra, ex pared} \
     que corta el acceso hacia el ${este, este}. \
     La única salida parece estar al ${oeste, oeste}."
);

locSalaReducida.ini = function() {
    this.mapPart = Loc.PartMapCenote;
    this.light = false;

    locSalaReducida.setExit( "oeste", locPresa );
};

const objParedDePiedra = ctrl.creaObj(
    "pared de piedra",
    [ "pared" ],
    "Una gran roca lisa y totalmente natural.",
    locSalaReducida,
    Ent.Scenery
);


// ================================================================== Pnjs

// ------------------------------------------------------------------- Player
const player = ctrl.personas.creaPersona(
    "Explorador",
    [ "explorador" ],
    "Pablo Salcedo, explorador de varios yacimientos mayas.",
    locBordeDelCenote
);

player.updateCmdObjs = function() {
    const loc = ctrl.places.getCurrentLoc();
    const dvCmdObjs = document.getElementById( "dvCmdObjs" );
    const pObjs = document.createElement( "p" );
    const objTemplate = "<a href='#' onclick=\"\
                         ctrl.addTerm('$id')\">$id</a> "

    dvCmdObjs.style = "display: none; text-align: center";
    dvCmdObjs.innerText = "";

    loc.personas.forEach( p => {
        const player = ctrl.personas.getPlayer();

        if ( p != player ) {
            pObjs.innerHTML += objTemplate.replaceAll( "$id", p.id );
        }
    });

    this.objs.forEach( obj => {
        pObjs.innerHTML += objTemplate.replaceAll( "$id", obj.id );;
    });

    loc.objs.forEach( obj => {
        pObjs.innerHTML += objTemplate.replaceAll( "$id", obj.id );;
    });

    dvCmdObjs.appendChild( pObjs );
}

player.postAction = function() {
    this.updateCmdObjs();
};

const objClothes = ctrl.creaObj(
    "prendas",
    [ "ropa", "ropaje", "ropas", "ropajes", "prendas" ],
    "Tu ropa de aguerrido explorador: botas, \
     pantalones cortos, fedora y camisa",
     player
);

player.ini = function() {
    objClothes.setWorn();
    this.updateCmdObjs();
};


// ------------------------------------------------------------------- Laura
const pnjLaura = ctrl.personas.creaPersona(
    "Laura",
    [ "laura", "mujer", "chica" ],
    "Laura Alsar, descendiente del antiguo explorador.",
    locBordeDelCenote
);

pnjLaura.stopMovingWithPlayer = function() {
    ctrl.removeDaemon( "Laura::withPlayer" );
};

pnjLaura.startMovingWithPlayer = function() {
    if ( ctrl.getDaemon( "Laura::withPlayer" ) == null ) {
        ctrl.addDaemon( "Laura::withPlayer", function() {
            const player = ctrl.personas.getPlayer();

            if ( this.owner != player.owner ) {
                pnjLaura.moveTo( player.owner );
                ctrl.places.updateDesc();
            }
        });
    }

    return;
};

pnjLaura.ini = function() {
    /*
     * MapPartGeneral - this.states[ 0 ]
     * MapPartCenote  - this.states[ 1 ]
     * MapPartPyramid - this.states[ 2 ]
     */
    this.states = [ 0, 0, 0 ];
    this.startMovingWithPlayer();
    ctrl.addDaemon( "Laura::needsLight", function() {
        const loc = ctrl.places.getCurrentLoc();

        if ( !loc.light
          && !ctrl.isPresent( objAntorcha )
          && !objAntorcha.isLit )
        {
            if ( loc == locSalaRecibidor ) {
                ctrl.goto( locCueva );
                ctrl.print( "Laura comienza a pegarse a las paredes, \
                             palpando en su alrededor." );
                pnjLaura.say( "Está demasiado oscuro... no puedo..." );
                ctrl.print( "Retrocedes siguiendo a Laura... está claro\
                           que no soporta la oscuridad." );
            } else {
                endGame( "<p><p>Laura empieza a hablar nerviosamente...\
                            <br/>&mdash;No puedo... no puedo.. ¡no puedo ver!</p>\
                            <p>Antes de que puedas evitarlo, la chica \
                            sale corriendo.</p>\
                            <p>&mdash;Tengo que salir... ¡TENGO QUE SALIR DE AQUÍ!</p>\
                            <p>Intentas seguir a Laura, pero a oscuras \
                            es muy complicado hacerlo sin tropezar y \
                            caer...</p>\
                            <p>&mdash;¡AHHHHHHHHHHHH!</p>\
                            <p>&mdash;¡Laura! ... ¡LAURA!</p>\
                            <p>Aunque no quieres creerlo, sabes \
                            perfectamente lo que ha pasado. Intentas \
                            localizarla por donde escuchaste el grito, \
                            pero sabes que lo más probable es que tú también \
                            termines cayendo...</p>",
                            "res/balcon.jpg" );
            }

        }
    });
};

pnjLaura.getAppropriateStatus = function() {
    const loc = ctrl.places.getCurrentLoc();

    return this.states[ loc.mapPart - Loc.MapPartGeneral ];
};

pnjLaura.setAppropriateStatus = function(x) {
    const loc = ctrl.places.getCurrentLoc();

    this.states[ loc.mapPart - Loc.MapPartGeneral ] = x;
};

pnjLaura.preTalkCenote = function() {
    const status = this.getAppropriateStatus();

    if ( status == 0 ) {
        this.say( "Los Mayas utilizaban \
                   los cenotes para realizar sacrificios, \
                   arrojando objetos de valor o incluso víctimas." );
        this.setAppropriateStatus( 1 );
    }

    return;
};

pnjLaura.preTalkGeneral = function() {
    const status = this.getAppropriateStatus();

    if ( status == 0 ) {
        this.say( "Deberíamos centrarnos en el problema." );
    }

    return;
};

pnjLaura.preTalkPyramid = function() {
    const status = this.getAppropriateStatus();

    if ( status == 0 ) {
        this.say( "Deberíamos centrarnos en el problema." );
    }

    return;
};

pnjLaura.showPathInPlatform = function() {
    let toret = "Laura te mira, expectante.";

    if ( !locPlataforma.pathShown ) {
        locPlataforma.pathShown = true;

        objPrendasLaura.moveTo( locPlataforma );

        this.stopMovingWithPlayer();
        locPlataforma.setExitBi( "abajo", locCueva );
        this.moveTo( locCueva );
        ctrl.places.updateDesc();

        objProfundidades.desc += " Podrías ${descender, baja} \
                                  buceando como Laura, \
                                  siguiendo los salientes.";

        toret = "Laura ha desaparecido en las \
                 ${profundidades, ex profundidades}.";

        this.say( "Había algún tipo de aparato de madera que \
                   permitía el traslado entre este punto y otro, \
                   en alguna parte, más abajo." );
        ctrl.print( "Laura, ante tus asombrados ojos, se quita \
                     la ropa para quedarse solo en bikini." );
        this.say( "¡Encontraré el camino, sígueme!" );
        ctrl.print( "La chica se zambulle decidida en el cenote. \
                     Te quedas un rato ensimismado, pensando en \
                     lo bien que le queda el bikini, mientras las \
                     ondas desaparecen... " );
    }

    return toret;
};

pnjLaura.preTalk = function() {
    const loc = ctrl.places.getCurrentLoc();

    if ( loc == locPlataforma ) {
        return this.showPathInPlatform();
    }

    switch( loc.mapPart ) {
        case Loc.MapPartGeneral:
            this.preTalkGeneral();
            break;
        case Loc.MapPartCenote:
            this.preTalkCenote();
            break;
        case Loc.MapPartPyramid:
            this.preTalkPyramid();
            break;
        default:
            ctrl.showError( "loc.mapPart: '$' not found in Laura.preTalk()"
                            .replace( '$', loc.mapPart ) );
    };

    return;
};


// ================================================================== End
function endGame(txt, imagePath)
{
    const dvCmds = document.getElementById( "dvCmds" );

    dvCmds.style.display = "none";
    txt += "<p style='text-align: right'>\
            <a href='javascript: location.reload()'>Recomenzar.</a>\
            <details style='text-align: right'><summary>Curiosidades.</summary>\
                <p>\
                    <p>Este relato interactivo fue escrito\
                    para la RayuelaJAM'2022.</p>\
                La idea vino dada por una mezcla de Cozumel (la famosa \
                aventura de AD), y de una fascinación por los Cenotes \
                mayas.<br/>\
                Espero que resulte entretenida, tanto como a mi lo fue \
                su creación.\
                </p>\
            </details>\
            </p>";

    ctrl.endGame( txt, imagePath );
}


// ================================================================== Start
ctrl.personas.changePlayer( player );
//ctrl.places.setStart( locBordeDelCenote );
ctrl.places.setStart( locCueva );
