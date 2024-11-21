//Se hace un archivo .js aparte para las clases por preferencias de organizacion
class Sprite { //Primero la clase para los sprites generales (Bastante util al querer adicionar animaciones al fondo)
    constructor({position, imageSrc, scale = 1, framesMax = 1, offset = {x:0, y:0}}) { //Se le asignan cierta cantidad de constructores que facilitaran el desarrollo del codigo
        this.position = position //Constructor de posicion, con variantes en x y y
        this.width = 50 
        this.height = 150 
        this.image = new Image() //Constructores de imagenes y su fuente
        this.image.src = imageSrc
        this.scale = scale
        this.framesMax = framesMax //Cantidad de frames por sprite
        this.framesCurrent = 0 //Numero de frame dentro del sprite
        this.framesElapsed = 0 //Cantidad de frames reproducidas en el momento
        this.framesHold = 8 //Congelarse en un frame especificos
        this.offset = offset
    }
    
    draw() { //Funcion que dibuja el sprite
        c.drawImage(
            this.image, //Se establece la imagen
            this.framesCurrent * (this.image.width / this.framesMax), 
            0,
            this.image.width / this.framesMax, //El dibujo de la imagen se reproduce frame a frame gracias a al division del ancho de imagen entre la cantidad de frames
            this.image.height,

            this.position.x - this.offset.x, //Se toma en cuenta el offset por padding de los sprites
            this.position.y - this.offset.y, 
            (this.image.width / this.framesMax) * this.scale, 
            this.image.height * this.scale
        )
        
    }

    animateFrames() { //La reproduccion de los frames en orden es gracias a un contador en aumento de los frames que se han reproducido
        this.framesElapsed++

        if(this.framesElapsed % this.framesHold === 0) {

        if(this.framesCurrent<this.framesMax - 1) {
            this.framesCurrent++ //El frame en reproduccion ira aumentando mientras sea menor al framesMax
        } else {
            this.framesCurrent = 0
        }
    }
    }
    
    update() { //La funcion de update incluye a ambas draw y animateFrames.
        this.draw()
        this.animateFrames()
}
}
    class Fighters extends Sprite { //Nuestra clase heredada para los personajes especificamente
        constructor({position, velocity, color = 'red', imageSrc, scale = 1, framesMax = 1, offset = {x:0, y:0}, sprites, attackBox = { offset: {}, width: undefined, height: undefined}}) {
           //Todos estos atributos se heredan de la clase Sprite
            super({
                position,
                imageSrc, 
                scale,
                framesMax,
                offset
                
            })

            this.velocity = velocity //Mientras estos constructores son pertenecientes solo a Fighters
            this.width = 50 
            this.height = 150 
            this.lastKey 
            this.attackBox = { 
                position: { 
                    x: this.position.x, 
                    y: this.position.y 
                }, 
            offset: attackBox.offset,
            width: attackBox.width,
            height: attackBox.height
        }
        
            this.color = color
            this.isAttacking //Se adiciona un constructor de "atacando" que mas adelante se desarrolla
            this.health = 100 //Se establece una vida del 100
            this.framesCurrent = 0
            this.framesElapsed = 0
            this.framesHold = 8
            this.sprites = sprites
            this.dead = false
            this.jumps = 0; //Contador de saltos

            for(const sprite in this.sprites) { //Designacion de sprites
                sprites[sprite].image = new Image(),
                sprites[sprite].image.src = sprites[sprite].imageSrc

            }
        }
        
        
        update() {
            this.draw();
            if (!this.dead) this.animateFrames(); //Mientras los personajes esten vivos se animan los frames, de lo contrario se detienen
        
            //Se actualizar posición de attackBox
            this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
            this.attackBox.position.y = this.position.y + this.attackBox.offset.y;
        
            //Se actualiza el movimiento en X
            this.position.x += this.velocity.x;
            //Para poder limitar movimiento en los bordes del canvas
            if (this.position.x < 0) this.position.x = 0;
            if (this.position.x + this.width > canvas.width) this.position.x = canvas.width - this.width;
        
            //Mientras que el movimiento en Y se condiciona
            this.position.y += this.velocity.y;
            if (this.position.y + this.height + this.velocity.y >= canvas.height - 100) { //Donde se designa el suelo
                this.velocity.y = 0;
                this.position.y = 326;
                this.jumps = 0; //Y restablece el contador de saltos al tocar el suelo
            } else {
                this.velocity.y += gravedad;
            }
        }
        
        
        
        attack() { //El ataque se vuelve una funcion donde el sprite sera el de ataque y la cualidad de "atacando" es verdadera
            this.switchSprite('attack1')
            this.isAttacking = true
            
        }

        takeHit() { //Lo mismo al recibir un golpe, se reconoce que va bajando la vida de 20 en 20 y al quedar en 0, se reproduce la aniamcion de muerte
        this.health -= 20

        if(this.health <= 0) {
        this.switchSprite('death')
        } else this.switchSprite('takeHit')
        }

switchSprite(sprite) { //Funcion de cambio de sprite

    if(this.image === this.sprites.death.image) {
        if(this.framesCurrent === this.sprites.death.framesMax - 1) //En lo que se llegue al ultimo frame de muerte el jugador se considera muerto
            this.dead = true
        return}

    //Interrupcion que llama la animacion de ataque
    if(this.image === this.sprites.attack1.image && this.framesCurrent < this.sprites.attack1.framesMax - 1) return

    //Interrupcion que llama la animacion de recibir ataque
    if(this.image === this.sprites.takeHit.image && this.framesCurrent < this.sprites.takeHit.framesMax - 1) return

    switch (sprite) { //El sprite cambia segun el caso
        case 'idle': 
        if (this.image !== this.sprites.idle.image) {
        this.image = this.sprites.idle.image
        this.framesMax = this.sprites.idle.framesMax
        this.framesCurrent = 0
        } break;
        case 'run':
        if (this.image !== this.sprites.run.image) {
        this.image = this.sprites.run.image
        this.framesMax = this.sprites.run.framesMax
        this.framesCurrent = 0
        } break;
        case 'jump':
        if (this.image !== this.sprites.jump.image) {
        this.image = this.sprites.jump.image
        this.framesMax = this.sprites.jump.framesMax
        this.framesCurrent = 0
        } break
        case 'fall':
        if (this.image !== this.sprites.fall.image) {
        this.image = this.sprites.fall.image
        this.framesMax = this.sprites.fall.framesMax
        this.framesCurrent = 0
        } break
        case 'attack1':
        if (this.image !== this.sprites.attack1.image) {
        this.image = this.sprites.attack1.image
        this.framesMax = this.sprites.attack1.framesMax
        this.framesCurrent = 0
        } break
        case 'takeHit':
        if (this.image !== this.sprites.takeHit.image) {
        this.image = this.sprites.takeHit.image
        this.framesMax = this.sprites.takeHit.framesMax
        this.framesCurrent = 0
        } break
        case 'death':
        if (this.image !== this.sprites.death.image) {
        this.image = this.sprites.death.image
        this.framesMax = this.sprites.death.framesMax
        this.framesCurrent = 0
        } break
    }
    
}

        } 
        