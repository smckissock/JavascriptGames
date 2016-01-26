
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
    game.load.image('kirby', 'assets/kirby.png');
    game.load.image('kirbychocolate', 'assets/kirbychocolate.png');
    game.load.image('sky', 'assets/sky.png');
    game.load.image('ground', 'assets/platform.png');
    game.load.image('star', 'assets/star.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

    //game.load.audio('music', 'assets/music/tommy_in_goa.mp3');
    game.load.audio('music', 'assets/music/oedipus_ark_pandora.mp3');
    game.load.audio('pickup', 'assets/sounds/p-ping.mp3');
    game.load.audio('leveldone', 'assets/sounds/lazer_off_wall.mp3');
    game.load.audio('scary', 'assets/sounds/magical_horror_audiosprite.mp3');
}

var prizesTotal = 20;
var prizesPickedUp = 0;

var music;
var pickup;
var leveldone;

var player;
var platforms;
var cursors;

var stars;
var score = 0;
var scoreText;

function create() {
    // We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    music = game.add.audio('music');
    music.play();

    pickup = game.add.audio("pickup");
    leveldone = game.add.audio("leveldone");

    // A simple background for our game
    game.add.sprite(0, 0, 'sky');

    addGround();
    addPlayer();
    addStars();

    // The score label
    scoreText = game.add.text(16, 16, 'Score 0', { fontSize: '32px', fill: '#000' });

    // Our controls.
    cursors = game.input.keyboard.createCursorKeys();
}



function addGround() {

    function addLedge(left, top, width) {
        var ledge = platforms.create(left, top, 'ground');
        ledge.scale.setTo(width, .3);
        ledge.body.immovable = true;
    }

    //  The platforms group contains the ground and the 2 ledges we can jump on
    //platforms = game.add.group();
    platforms = game.add.physicsGroup();

    //  We will enable physics for any object that is created in this group
    platforms.enableBody = true;

    addLedge(0, game.world.height - 10, 2)

    addLedge(50, 100, .3);
    addLedge(100, 250, .3);
    addLedge(200, 500, .3);
    addLedge(300, 200, .3);
    addLedge(400, 400, .3);
    addLedge(500, 300, .3);
    addLedge(500, 150, .3);

    //platforms.setAll('body.allowGravity', false);
    //platforms.setAll('body.immovable', true);
    //platforms.setAll('body.velocity.x', 50);
}


function addPlayer() {
    // The player and its settings
    //player = game.add.sprite(32, game.world.height - 150, 'dude');
    player = game.add.sprite(32, game.world.height - 150, 'kirby');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Player physics properties. Give the little guy a slight bounce.
    player.body.bounce.y = 0.2;
    player.body.gravity.y = 500;
    player.body.collideWorldBounds = true;

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);
}


function wrapPlatform(platform) {
    //if (platform.body.velocity.x < 0 && platform.x <= -160)
    //{
    //    platform.x = 640;
    //}
    //else

    if (platform.body.velocity.x > 0 && platform.x >= 800) {
        debugger;
        platform.x = 0;
    }

}

function addStars() {
    stars = game.add.group();

    //  We will enable physics for any star that is created in this group
    stars.enableBody = true;

    //  Here we'll create 12 of them evenly spaced apart
    for (var i = 0; i < prizesTotal; i++) {
        //  Create a star inside of the 'stars' group
        var star = stars.create(i * 35, 0, 'kirbychocolate');
        //  Let gravity do its thing
        star.body.gravity.y = 300;
        //  This just gives each star a slightly random bounce value
        star.body.bounce.y = 0.7 + Math.random() * 0.2;
    }
}

function update() {

    //platforms.forEach(wrapPlatform, this);


    //  Collide the player and the stars with the platforms
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        //  Move to the left
        player.body.velocity.x = -150;
        player.animations.play('left');
    }
    else if (cursors.right.isDown) {
        //  Move to the right
        player.body.velocity.x = 150;
        player.animations.play('right');
    }
    else {
        //  Stand still
        player.animations.stop();
        player.frame = 4;
    }

    //  Allow the player to jump if they are touching the ground.
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = -350;
    }
}

function collectStar(player, star) {
    // Removes the star from the screen
    star.kill();
    pickup.play();

    //  Add and update the score
    score += 10;
    scoreText.text = 'Score ' + score;

    prizesPickedUp++;
    if (prizesPickedUp == prizesTotal)
        endLevel();
}

function endLevel() {
    music.stop();
    //leveldone.play();
}