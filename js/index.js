const canvas = document.querySelector('canvas'); //Se guarda el canvas de html en js
const c = canvas.getContext('2d'); //Se crea en planos x y y

canvas.width = 1024; //Determinamos una resolucion estandar
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height)

const gravedad = 0.7 //Establecemos una gravedad para los jugadores

const background = new Sprite({ //Se crea constante background (fondo) y se le coloca una imagen
    position: {
        x: 0,
        y: 0
    },
    imageSrc: './img/FondoLlanos.png', 
})

const player = new Fighters({ //Se crea una constante player (Florentino) perteneciente a la clase Fighters desarrollada en classes.js
    position: { //Establecemos su posicion
    x: 100,
    y: 0
},
    velocity: {
    x: 0,
    y: 0
},
    offset: {
    x: 0,
    y: 0
},
    imageSrc: './img/Florentino/Idle Florentino.png', //Se trae a pantalla el sprite por defecto de Florentino
    framesMax: 4, //Se indica cuantas frames tiene el sprite
    scale: 1,
    offset: {
        x: 200, //Se designa un offset debido al padding que mantiene el sprite
        y: 125
    },
    sprites: { //Establecemos diferentes sprites de animacion segun la accion a realizar
        idle: { //Neutral
            imageSrc: './img/Florentino/Idle Florentino.png', //Se importa el png con los diferentes frames de animacion
            framesMax: 4 //Y se indica cuantos frames tiene. -Se hace lo mismo en el resto-.
        },
        run: { //Correr
            imageSrc: './img/Florentino/Run Florentino.png',
            framesMax: 6
        
        },
        jump: { //Saltar
            imageSrc: './img/Florentino/Jump Florentino.png',
            framesMax: 2
        
        },
        fall: { //Caer
            imageSrc: './img/Florentino/Fall Florentino.png',
            framesMax: 2
        
        },
        attack1: { //Ataque
            imageSrc: './img/Florentino/Attack Florentino.png',
            framesMax: 4
        
        },
        takeHit: { //Recibir ataque
            imageSrc: './img/Florentino/TakeHit Florentino.png',
            framesMax: 4
        },
        death: { //Morir
            imageSrc: './img/Florentino/Death Florentino.png',
            framesMax: 6
        }
    },
    attackBox: { //Para la attackBox construida en classes.js, definimos un rectangulo fuera de Florentino que reconocera el alcance de sus golpes
        offset: {
            x: 50,
            y: 50
        },
        width: 150,
        height: 50
    }
})

const enemy = new Fighters({ //Lo mismo hecho con player, se hace con enemy (diablo), que es de la misma clase
    position: { //La posicion principal cambia, porque al Diablo lo queremos del otro lado de la pantalla
    x: 900, 
    y: 100
},
    velocity: {
    x:0,
    y:0
    },
    offset: {
    x: -50,
    y: 0
},
imageSrc: './img/Diablo/Sprites/Idle Diablo.png', //Se importa el sprite neutral con su cantidad de frames, y repetimos el proceso igual al de Florentino
framesMax: 4,
scale: 1,
offset: {
    x: 240,
    y: 150
},
sprites: {
    idle: {
        imageSrc: './img/Diablo/Sprites/Idle Diablo.png',
        framesMax: 4
    },
    run: {
        imageSrc: './img/Diablo/Sprites/Run Diablo.png',
        framesMax: 6
    
    },
    jump: {
        imageSrc: './img/Diablo/Sprites/Jump Diablo.png',
        framesMax: 4
    
    },
    fall: {
        imageSrc: './img/Diablo/Sprites/Fall Diablo.png',
        framesMax: 4
    
    },
    attack1: {
        imageSrc: './img/Diablo/Sprites/Attack Diablo.png',
        framesMax: 4
    },
    takeHit: {
        imageSrc: './img/Diablo/Sprites/TakeHit Diablo.png',
        framesMax: 4
    },
    death: {
        imageSrc: './img/Diablo/Sprites/Death Diablo.png',
        framesMax: 5
    }
    },
    attackBox: {
        offset: {
            x: -180,
            y: 50
        },
        width: 160,
        height: 50
    }
})

const keys = { //En este momento se definen a las keys (teclas) y se predispone a que ninguna este siendo presionada
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    },
}

function iniciarJuego() { //Se construye la funcion de iniciar el juego, que se ejecuta al presionar jugar en el menu de inicio

    //En este momento oculta el menú de inicio y muestra el canvas
    document.getElementById('menuInicio').style.display = 'none';
    animacion(); //Inicia el ciclo de animación del juego
    contadorTimer(); //E inicia el temporizador del juego

    //Conjunto a esto, comienza la música de fondo
    const musicaFondo = new Audio('./audio/SoundtrackJuego.mp3');
    musicaFondo.loop = true; //Esto es para que la música se repita en bucle y no acabe repentinamente
    musicaFondo.play();
    

}

function mostrarInstrucciones() { //Demas funciones establecidas, asociadas con el menu de inicio
    document.getElementById('instrucciones').style.display = 'flex'; //Esta mostrara la pantalla de instrucciones con su estructura CSS
}

function cerrarInstrucciones() {
    document.getElementById('instrucciones').style.display = 'none'; //Esta cerrara la pantalla de instrucciones
}

function cerrarJuego() {
    window.close(); //Esta cierra la ventana del juego =completamente al colocar salir
}


function colisionesRectangulares({ //Estos son los rectangulos que describen el espacio que ocupa un personaje, y sirve para filtrar si esta siendo golpeado por la attackbox
rectangle1,
rectangle2

}) {
    return (rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x && 
        rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width && 
        rectangle1.attackBox.position.y + rectangle1.attackBox.height >= rectangle2.position.y &&
        rectangle1.attackBox.position.y <= rectangle2.position.y + rectangle2.height
    ) //Aunque se ve largo, la colision ha sido definida con operadores logicos de forma de que cuando la attackBox y el sprite del personaje se encuentren en un punto x, dentro de el ancho de ambos, se detecta la colision
}

function determinarGanador({player, enemy, timerId}) { //Esta funcion determina en que estado se ha acabado el juego
    clearTimeout(timerId)
    document.querySelector('#displayText').style.display = 'flex'
    if(player.health === enemy.health) { //Si el tiempo ha acabado y las barras de vidas de ambos son iguales, o ninguno ha muerto, entonces es empate
        document.querySelector('#displayText').innerHTML = 'Empate'
        
    } else if(player.health>enemy.health){ //Aqui, sin necesidad de que acabe el tiempo, dependiendo del que muera primero, se establece quien gana
        document.querySelector('#displayText').innerHTML = 'Florentino gana!'
    } else if(player.health<enemy.health){
        document.querySelector('#displayText').innerHTML = 'El diablo gana!'
    } 
}

let timer = 60 //Contamos con un timos de 60 segundos 
let timerId
function contadorTimer() {

if(timer>0) {
    timerId = setTimeout(contadorTimer, 1000) //El timer ira de 60s a 0, de 1s en un 1s, o sea, tiempo real
    timer--
    document.querySelector('#timer').innerHTML = timer //Este timer se enlaza con el HTML
}

if(timer === 0){ //Cuando el timer llega a 0 es necesairo acabar el juego, por ende se determina el ganador por defecto

determinarGanador({player, enemy, timerId})
}
}

function animacion() { //De nuestras funciones mas importantes, nuestra funcion de animacion
    window.requestAnimationFrame(animacion);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);
    background.update() //Aqui se carga el fondo
    c.fillStyle = 'rgba(255, 255, 255, 0.1)' //Con un leve color blanco por encima para evitar que el fondo sea muy llamativo
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update(); //Se cargan los personajes
    enemy.update();

    player.velocity.x = 0; //Sus velocidades en x, o sea, al correr son 0 por defecto, para que no se muevan a no ser de tocar la tecla necesaria
    enemy.velocity.x = 0;
 

    if (keys.a.pressed && player.lastKey === 'a') { //Como a es para desplazar a Florentino a la izquierda, se sustraen valores en x y se aplica la animacion de correr
        player.velocity.x = -5;
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') { //Como d es para desplazar a Florentino a la derecha, se suman valores en x y se aplica la animacion de correr
        player.velocity.x = 5;
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }
    //Establecemos los saltos para que mientras y sea positivo y hacia arriba, se vea la animacion de saltar
    if(player.velocity.y < 0) {
        player.switchSprite('jump')
    //Y cuando y sea negativa por la caida-gravedad, el sprite sera de caida
    } else if(player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    //Lo mismo haremos en el caso del diablo con sus teclas y sprites correspondientes
    
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5;
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5;
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    if(enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if(enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    //En este momento se define que si hay colision entre la hitBox y attackBox de los personajes, y uno ataca, el otro pierde vida
    if(
        colisionesRectangulares({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking && player.framesCurrent === 2 //Aqui se modifica en que frame se le restara la vida para que sea al mismo tiempo que se ve el ataque
    ) {
        enemy.takeHit()
        player.isAttacking = false
        gsap.to('#enemyVida', {
            width: enemy.health + "%"
        })
        
    }

    //En caso de no existir colision, el ataque simplemente se toma como un booleano falso y no cuenta
    if(player.isAttacking && player.framesCurrent === 2) {
        player.isAttacking = false
    }


    //Exactamente lo mismo aplica con las variables de Fighters invertidas.
    if(
        colisionesRectangulares({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        enemy.isAttacking && enemy.framesCurrent === 2
    ) {
        player.takeHit()
        enemy.isAttacking = false
        gsap.to('#playerVida', {
            width: player.health + "%"
        })
    }

    
    if(enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }


//Si el timer no ha llegado a 0, pero una de las vidas se ha acabado, acabara el juego e imprimira el ganador
if(enemy.health<= 0 || player.health<= 0) {
determinarGanador({player, enemy, timerId})
}

}
//Este event listener reconocera como eventos el tocar las teclas. Lo que anteriormente se presento como const keys en valores falsos, aqui se definen como verdaderos si se toca la tecla
window.addEventListener('keydown', (event) => {
    if(!player.dead){ //mientras que Florentino no este muerto:

    switch(event.key) {
        case 'd':
        keys.d.pressed = true //Aqui ya se habra definido que sucede con la velocidad al presionar la d
        player.lastKey = 'd' //Considerando que la ultima tecla tocada sea d, aunque se mantengan otras presionadas
        break
        case 'a': //Lo mismo en este caso.
        keys.a.pressed = true
        player.lastKey = 'a'
        break
        case 'w':
            if (player.jumps < 1) { //Lo que pasa cuando se salta no esta predefinido, entonces se describe que solo se puede dar un salto a la vez
                player.velocity.y = -20; //Y esto involucra la subida del jugador por 20 verticalmente.
                player.jumps++;
            }
        break
        case ' ': //En este caso se define que con la tecla de ataque, se llama a la funcion de ataque
        player.attack()
        break

  
    }
}
    if(!enemy.dead){ //Exactamente lo mismo que con Florentino, pero con las teclas del Diablo

    switch(event.key) {
    case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
        case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
        case 'ArrowUp':
            if (enemy.jumps < 1) {
                enemy.velocity.y = -20;
                enemy.jumps++;
            }
        break
        case 'ArrowDown':
        enemy.attack()
    }
}
})
//Cuando se suelta una tecla (keyup) detiene el movimiento de los personajes cuando se dejan de presionar las teclas de desplazamiento
window.addEventListener('keyup', (event) => {
    switch(event.key) {
        case 'd':
        keys.d.pressed = false
        break
        case 'a':
        keys.a.pressed = false
        break
    }

    switch(event.key) {
        case 'ArrowRight':
        keys.ArrowRight.pressed = false
        break
        case 'ArrowLeft':
        keys.ArrowLeft.pressed = false
        break
    }
})
