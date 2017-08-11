

var game = new Phaser.Game(960, 608, Phaser.AUTO, 'Pokemon', { preload: preload, create: create, update: update });


function Player(game, x, y){
    Phaser.Sprite.call( this, game , x , y, 'Charizard')
    this.anchor.set(0.5, 0.5)
    this.game.physics.enable(this)
    this.body.collideWorldBounds= true
    this.scale.setTo(2, 2)
    this.health= 3

        // this.Player= game.add.sprite( 'Charizard')
    this.animations.add('stop', [1], 5)
    this.animations.add('runright', [6,7], 7, false)
    this.animations.add('runleft', [4,5], 7, false)
    this.animations.add('jump', [7,8], true)
}

Player.prototype= Object.create(Phaser.Sprite.prototype)

Player.prototype.constructor= Player;

Player.prototype.move= function(direction){
        var SPEED = 200
    this.body.velocity.x= direction * SPEED

    
}
Player.prototype.jump= function(){
    
    var JUMP_SPEED = 10000;
    var canJump= this.body.onFloor()

    this.body.velocity.y= 10
    
    if(canJump) {
        this.body.velocity.y= -JUMP_SPEED
      
    } 
    
}
   

Player.prototype.AnimationName= function(){
    let name;

    //jumping


    //falling
     if(!this.body.touching.down && controls.right.isDown){
        name= 'runright'
    }
     else if(!this.body.touching.down && controls.left.isDown){
        name= 'runleft'
    }
    //running
    else if(this.body.velocity.x > 0){
        name= 'runright'
    }
     else if(this.body.velocity.x < 0){
        name= 'runleft'
    }

    return name
}

Player.prototype.update= function(){


    let animationName= this.AnimationName()
        this.animations.play(animationName)
  
}



function Diglet(game, x, y){
    Phaser.Sprite.call(this, game , x , y, 'diglet')
    this.anchor.set(0.5, 1)
    this.game.physics.enable(this)
    this.body.collideWorldBounds= true
    this.scale.setTo(1, 1)
    this.body.immovable= true;
    this.body.velocity.x= Diglet.SPEED
    this.animations.add('stop', [1,2], 5, true)
    this.animations.add('die', [3,4,5,6], 5)
    this.animations.play('stop')
     

 
  
}
Diglet.SPEED= -100 

Diglet.prototype= Object.create(Phaser.Sprite.prototype)

Diglet.prototype.constructor= Diglet;

Diglet.prototype.update= function(){
if(this.body.blocked.right){
        this.body.velocity.x= Diglet.SPEED
        this.scale.setTo(1, 1)
    }
    else if(this.body.blocked.left){
        this.body.velocity.x = -Diglet.SPEED
        this.scale.setTo(-1, 1)
    }
}
Diglet.prototype.die= function(){
    this.body.enable= false;
    this.animations.play('die').onComplete.addOnce(function(){

        this.kill()
    }, this)
}


function preload() {

        game.load.tilemap('Room1', 'data/Level_01.json', null, Phaser.Tilemap.TILED_JSON)
        game.load.image('Castle', 'images/castle.png')
        game.load.spritesheet('Charizard', 'images/charizard.png', 32.7,30)
        game.load.audio('sfx:flapping', 'audio/flapping.wav')
        game.load.spritesheet('fire', 'images/fire.png', 10,10)
        game.load.audio('sfx:firing', 'audio/firing.wav')
        game.load.tilemap('Room2', 'data/Level_2.json', null, Phaser.Tilemap.TILED_JSON)
        game.load.image('forest', 'images/grass.png')
        game.load.image('bricks', 'images/night.png')
        // game.load.spritesheet('HOHO', 'images/ho-ho.png', 90, 76,4 ,1)
        game.load.audio('sfx:door', 'audio/door.wav')
        game.load.spritesheet('diglet', 'images/diglet.png', 37.5, 30, 5)
        game.load.audio('sfx:hurt', 'audio/hurt.wav')
         game.load.audio('sfx:Enemyhurt', 'audio/enemyHurt.wav')


}






var theCurrentLevel= 0
var map;
var layer;
var controls= {}
var sfx;
var firing;
var fireTime= 0
var map;
var GRAVITY= 1200
var object
var door
var spawn
var exitdoor
var playerposition
var enemy
var digger
var digletEnemy




function create(){
        
        
        game.stage.backgroundColor= '#0aa5ff'
        levels()

        map.createLayer('Background1')
        map.createLayer('Background2')
        layer = map.createLayer('Ground')
        game.physics.arcade.gravity.y= GRAVITY
        // layer.debug= true 
        game.renderer.renderSession.roundPixels= true
        createCharacters()
        levelSpecifics()
        bullets() 
        map.setCollisionBetween(1, 1000, true, 'Ground')
       
        

        controls = {
            right: this.input.keyboard.addKey(Phaser.Keyboard.D),
            left: this.input.keyboard.addKey(Phaser.Keyboard.A),
            jump: this.input.keyboard.addKey(Phaser.Keyboard.W),
            shoot: this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
            action: this.input.keyboard.addKey(Phaser.Keyboard.E)
      }
        sfx= {
            firing: game.add.audio('sfx:firing'),
            flapping: game.add.audio('sfx:flapping'),
            door: game.add.audio('sfx:door'),
            hurt: game.add.audio('sfx:hurt'),
            enemyHurt: game.add.audio('sfx:Enemyhurt')
        }
     }


 levelSpecifics= function(){
     if(theCurrentLevel == 1){
         Enemys()
     }
 }


levels= function(){
    if(theCurrentLevel == 0){
        map= game.add.tilemap('Room1')
        map.addTilesetImage('Castle', 'Castle')
        spawn= map.objects.Action[0]
        door= map.objects.Action[1]
        exitdoor= new Phaser.Rectangle(door.x, door.y, door.width, door.height)
      

     }
     if(theCurrentLevel == 1){
        map= game.add.tilemap('Room2')
        map.addTilesetImage('forest', 'forest')
        map.addTilesetImage('bricks', 'bricks')
        game.world.setBounds(0, 0, 3620, 1250)
        spawn= map.objects.Action[0]
        
     }
}
    
Enemys= function(){
    digletEnemy = game.add.group()
   
  
    for(var i = 0; i< 4; i++){
      let sprite= new Diglet(game, 360 + Math.random() * 1000, 1150)
        digletEnemy.add(sprite)
    }
    
 
        
        

}
      
createCharacters= function(){
      player= new Player(game, spawn.x, spawn.y)
        this.game.add.existing(player)
         game.camera.follow(player);
         playerposition=player.position

}
        
bullets= function(){
    firing = game.add.group();
        firing.enableBody = true;
        firing.physicsBodyType = Phaser.Physics.ARCADE;
        firing.createMultiple(1, 'fire');
        firing.setAll('body.allowGravity', false)
        firing.setAll('anchor.setTo', 'anchor', 0.5, 1.0);
        firing.setAll('outOfBoundsKill', true);
        firing.setAll('checkWorldBounds', true);

}


        

function update(){
    handleInput()
    handleCollisions()
    if (game.input.activePointer.isDown)
    {
       fireFire()
    }

     if( controls.jump.isDown)
     {
        player.body.velocity.y= -500
        sfx.flapping.play('', -100)
     }

   
}





handleCollisions= function(){
    if(Phaser.Rectangle.containsPoint(exitdoor, playerposition) && controls.action.isDown){
        sfx.door.play('', 0)
        theCurrentLevel++

        game.state.start(game.state.current);

     }

    this.game.physics.arcade.collide(player, layer)
     this.game.physics.arcade.collide(digletEnemy, layer)
      this.game.physics.arcade.collide(player, digletEnemy, die)
    this.game.physics.arcade.collide(firing, digletEnemy, kill)
   
}
 kill= function(firing, digletEnemy){
     sfx.enemyHurt.play('', 0.2)
    firing.kill()
    digletEnemy.health-=1
    console.log(digletEnemy.health)
    if(digletEnemy.health === -5){
         digletEnemy.die()
    }
 
 }

die= function(player){
    
    if (!player.invincible) { 
         sfx.hurt.play()
        player.health--
        tweenTint(player, 0xff0000, 0xFFFFFF, 2000);
        toggleInvincible();     
        game.time.events.add(2000, toggleInvincible, this);   
        if(player.health == 0){
     game.state.restart()
  }  
        }
    }
  
   



    toggleInvincible= function() {   
     player.invincible = !player.invincible;
     
    
 }



 handleInput= function(){

    if(this.controls.left.isDown){
        
       this.player.move(-1)

    }

     else if(this.controls.right.isDown){
       
       this.player.move(1)
    }
     
      else{
            this.player.move(0)
        }

 }

 
   
 function fireFire() {
   
    
   if(game.time.now> fireTime){

        var fire = firing.getFirstExists(false);
         if (fire) {

            sfx.firing.play('', .2)

        if(player.animations.name == 'runright' ){
            fire.reset(player.x +30, player.y - 10);
            fire.body.velocity.x = 500;
            fire.lifespan = 1000
            game.physics.arcade.moveToPointer(fire, 300);

        }
        else{
             fire.reset(player.x -40, player.y - 10);
             fire.body.velocity.x = -500;
             fire.lifespan = 1000
            game.physics.arcade.moveToPointer(fire, 300);
        }

        }
    }
 
}


function tweenTint(obj, startColor, endColor, time) { 
    var colorBlend = {step: 0}; 
    var colorTween = game.add.tween(colorBlend).to({step: 100}, time);
        colorTween.onUpdateCallback(function() {    
          obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);      
           });    
               obj.tint = startColor;          
             colorTween.start();

    }
 






 
