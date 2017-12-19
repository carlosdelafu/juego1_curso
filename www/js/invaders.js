var app = {
 //alto : 0, ancho : 0, vx: 0 , vy: 0,
 //iphone 320 x 568
 
 inicio: function () {
    app.alto = document.documentElement.clientHeight;
    app.ancho = document.documentElement.clientWidth;
    console.log('XXX inicio    ' + app.ancho + '  ' + app.alto);

    app.iniciaJuego();
    console.log('XXX tras iniciaJuego');
    app.vigilaSensores();
 },
 
    
 iniciaJuego: function () {
    function preload() {
        game.load.image('bullet', 'img/bullet.png');
        game.load.image('enemyBullet', 'img/enemy-bullet.png'); 
        game.load.spritesheet('invader', 'img/invader32x32x4.png', 32, 32);
        game.load.image('ship', 'img/player.png');
        game.load.spritesheet('kaboom', 'img/explode.png', 128, 128);
        game.load.image('starfield', 'img/starfield.png');
        game.load.image('background', 'img/background2.png');
    console.log('XXX preload');
    }

 
    var vx = 0;
    var vy = 0;
    var player;
    var aliens;
    var bullets;
    var bulletTime = 0;
    var cursors;
    var fireButton;
    var explosions;
    var starfield;
    var score = 0;
    var scoreString = '';
    var scoreText;
    var fireString = '';
    var fireText;
    var moveString = '';
    var moveText;
    var lives;
    var enemyBullet;
    var firingTimer = 0;
    var stateText;
    var livingEnemies = [];
 

    function create() {
         console.log('XXX  CREATE : ' + firingTimer);

        game.physics.startSystem(Phaser.Physics.ARCADE);

        //  The scrolling starfield background
       // starfield = game.add.tileSprite(0, 0, 800, 600, 'starfield');
       
        starfield = game.add.tileSprite(0, 0, app.ancho, app.alto, 'starfield');

        //  Our bullet group
        bullets = game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;
        bullets.createMultiple(30, 'bullet');
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 1);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);

        // The enemy's bullets
        enemyBullets = game.add.group();
        enemyBullets.enableBody = true;
        enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
        enemyBullets.createMultiple(30, 'enemyBullet');
        enemyBullets.setAll('anchor.x', 0.5);
        enemyBullets.setAll('anchor.y', 1);
        enemyBullets.setAll('outOfBoundsKill', true);
        enemyBullets.setAll('checkWorldBounds', true);

        //  The hero!
        player = game.add.sprite(app.ancho/2, 4*app.alto/5, 'ship');//400  500
        player.anchor.setTo(0.5, 0.5);
        game.physics.enable(player, Phaser.Physics.ARCADE);
 
        player.body.collideWorldBounds = true;
        //  The baddies!
        aliens = game.add.group();
        aliens.enableBody = true;
        aliens.physicsBodyType = Phaser.Physics.ARCADE;

        createAliens();

        //  The score
        scoreString = 'Score : ';
        scoreText = game.add.text(10, 10, scoreString + score, { font: '24px Arial', fill: '#fff' });
//  The fire
        fireString = 'TAP for FIRE';
        fireText = game.add.text(game.world.centerX- 24*fireString.length/4, 9*app.alto/10, fireString , { font: '24px Arial', fill: '#fff' });
        
        moveString = 'Move telephone for move ship ';//+ scoreString.length+'  '+24*fireString.length/2;
        moveText = game.add.text(game.world.centerX- 18*fireString.length/2, 17*app.alto/18, moveString , { font: '18px Arial', fill: '#fff' });


        //  Lives
        lives = game.add.group();
        txt_lives = 'Lives : ';
        game.add.text(game.world.width - 170, 10, txt_lives, { font: '24px Arial', fill: '#fff' });

        //  Text
        stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '32px Arial', fill: '#fff' });
        stateText.anchor.setTo(0.5, 0.5);
        stateText.visible = false;

        for (var i = 0; i < 3; i++) 
        {
            var ship = lives.create(game.world.width - 80 + (30 * i), 25, 'ship');
            ship.anchor.setTo(0.5, 0.5);
            ship.angle = 90;
            ship.alpha = 0.4;
        }

        //  An explosion pool
        explosions = game.add.group();
        explosions.createMultiple(30, 'kaboom');
        explosions.forEach(setupInvader, this);

        //  And some controls to play the game with
        cursors = game.input.keyboard.createCursorKeys();
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        console.log('XXX  FIN  CREATE  ');

    }
    

    function update() {

        //  Scroll the background
        starfield.tilePosition.y += 2;

        if (player.alive)
        {
            //  Reset the player, then check for movement keys
            player.body.velocity.setTo(0, 0);

            if (cursors.left.isDown)
            {
                player.body.velocity.x = -200;
            }
            else if (cursors.right.isDown)
            {
                player.body.velocity.x = 200;
            }else{ 
             //   console.log('XXX vx:' + vx)
                if (app.vx < - 1)
                {
                    player.body.velocity.x = 200;
                }
                else if (app.vx > 1)
                {
                    player.body.velocity.x = -200;
                }
            } 

            //  Firing?


            if (fireButton.isDown || game.input.activePointer.isDown)
            {
                fireBullet();
            }

            if (game.time.now > firingTimer)
            {
                enemyFires();
            }

            //  Run collision
            game.physics.arcade.overlap(bullets, aliens, collisionHandler, null, this);
            game.physics.arcade.overlap(enemyBullets, player, enemyHitsPlayer, null, this);
        }

    }
    
    
    
    
    function render() {

    // for (var i = 0; i < aliens.length; i++)
    // {
    //     game.debug.body(aliens.children[i]);
    // }

    }
     
 /*   
    function  createAliens() {
         console.log('XXX  createAliens  ');

    for (var y = 0; y < 3; y++)
    {
        for (var x = 0; x < 5; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
            alien.body.moves = false;
        }
    }

    aliens.x = 30;
    aliens.y = 80;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong to, rather than the invaders directly.
    var tween = game.add.tween(aliens).to( { x: 100 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);

    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
    }
*/
     
    function  createAliens() {
         console.log('XXX  createAliens  ');

    for (var y = 0; y < 3; y++)
    {
        for (var x = 0; x < app.ancho/64; x++)
        {
            var alien = aliens.create(x * 48, y * 50, 'invader');
            alien.anchor.setTo(0.5, 0.5);
            alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
            alien.play('fly');
            alien.body.moves = false;
        }
    }

    aliens.x = 30;
    aliens.y = 80;

    //  All this does is basically start the invaders moving. Notice we're moving the Group they belong
    //   to, rather than the invaders directly.
    //x:100  es la longitud del "contoneo""
    var tween = game.add.tween(aliens).to( { x: 100 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);



    //  When the tween loops it calls descend
    tween.onLoop.add(descend, this);
    }
    
    
    
 function descend () {

    aliens.y += 10;

}
function setupInvader  (invader) {

    invader.anchor.x = 0.5;
    invader.anchor.y = 0.5;
    invader.animations.add('kaboom');

}
   

function collisionHandler  (bullet, alien) {

    //  When a bullet hits an alien we kill them both
    bullet.kill();
    alien.kill();

    //  Increase the score
    score += 20;
    scoreText.text = scoreString + score;

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(alien.body.x, alien.body.y);
    explosion.play('kaboom', 30, false, true);

    if (aliens.countLiving() == 0)
    {
        score += 1000;
        scoreText.text = scoreString + score;

        enemyBullets.callAll('kill',this);
        stateText.text = " You Won, \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}

function enemyHitsPlayer  (player,bullet) {
    
    bullet.kill();

    live = lives.getFirstAlive();

    if (live)
    {
        live.kill();
    }


    navigator.vibrate(100);

    //  And create an explosion :)
    var explosion = explosions.getFirstExists(false);
    explosion.reset(player.body.x, player.body.y);
    explosion.play('kaboom', 30, false, true);

    // When the player dies
    if (lives.countLiving() < 1)
    {
        player.kill();
        enemyBullets.callAll('kill');

        stateText.text=" GAME OVER \n Click to restart";
        stateText.visible = true;

        //the "click to restart" handler
        game.input.onTap.addOnce(restart,this);
    }

}

function enemyFires  () {

    //  Grab the first bullet we can from the pool
    enemyBullet = enemyBullets.getFirstExists(false);

    livingEnemies.length=0;

    aliens.forEachAlive(function(alien){

        // put every living enemy in an array
        livingEnemies.push(alien);
    });


    if (enemyBullet && livingEnemies.length > 0)
    {
        
        var random=game.rnd.integerInRange(0,livingEnemies.length-1);

        // randomly select one of them
        var shooter=livingEnemies[random];
        // And fire the bullet from this enemy
        enemyBullet.reset(shooter.body.x, shooter.body.y);

        game.physics.arcade.moveToObject(enemyBullet,player,120);
        firingTimer = game.time.now + 2000;
    }

}

function fireBullet  () {

    //  To avoid them being allowed to fire too fast we set a time limit
    if (game.time.now > bulletTime)
    {
        //  Grab the first bullet we can from the pool
        bullet = bullets.getFirstExists(false);

        if (bullet)
        {
            //  And fire it
            bullet.reset(player.x, player.y + 8);
            bullet.body.velocity.y = -400;
            bulletTime = game.time.now + 200;
        }
    }

}

function resetBullet  (bullet) {

    //  Called if the bullet goes out of the screen
    bullet.kill();

}

function restart  () {

    //  A new level starts
            console.log('XXX  restart  ');

    //resets the life count
    lives.callAll('revive');
    //  And brings the aliens back from the dead :)
    aliens.removeAll();
    createAliens();
 
    //revives the player
    player.revive();
    //hides the text
    stateText.visible = false;

}

    var game = new Phaser.Game(app.ancho, app.alto, Phaser.AUTO, 'juego1', { preload: preload, create: create, update: update, render: render });

 //var game = new Phaser.Game(app.ancho, app.alto, Phaser.AUTO, 'juego1', { preload: preload, create: create, update: update, render: render });
 },
 
 /*
vigilaSensores: function () {
    var opciones = {frequency: 100};
    function onError() {
    console.log('Error');
 }
 function onSuccess(datosAceleracion) {
    app.detectaAgitacion(datosAceleracion);
    app.registraMovimiento(datosAceleracion);
 }
 navigator.accelerometer.watchAcceleration(onSuccess, onError, opciones);
 },
 registraMovimiento: function (datosAceleracion) {
    app.vx = datosAceleracion.x;
    app.vy = datosAceleracion.y;
 },
 detectaAgitacion: function (datosAceleracion) {
    var acX = datosAceleracion.x > app.umbral;
    var acY = datosAceleracion.y > app.umbral;
    if (acX || acY) {
    setTimeout(app.recomienza,1000);
 }
 },
*/

vigilaSensores: function  () {
    var opciones = {frequency: 100};
            console.log('XXX   vigilaSensores');

    function onError() {
        console.log('Error vigilaSensores');
    }
    function onSuccess(datosAceleracion) {
        //app.detectaAgitacion(datosAceleracion);
                    console.log('onSuccess(datosAceleracion) ');

        app.registraMovimiento(datosAceleracion);
    }
    navigator.accelerometer.watchAcceleration(onSuccess, onError, opciones);
 },
 registraMovimiento: function  (datosAceleracion) {
    console.log('registraMovimiento: ' + datosAceleracion.x);

    app.vx = datosAceleracion.x;
    app.vy = datosAceleracion.y;
 },
 

}

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function () {
   console.log('XXX Listener  ');

    app.inicio();
 }, false);
}