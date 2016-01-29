
//var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game');

var Kirby = function () {
    this.prizesTotal = 20;
    this.prizesPickedUp = 0;

    this.music;
    this.pickup;
    this.leveldone;

    this.player;
    this.platforms;
    this.floor;
    this.cursors;

    this.stars;
    
    this.score = 0;
    this.scoreText;

    this.frameCount = 0;
}

Kirby.prototype = {

    init: function () {
        
    },

    preload: function() {

        this.load.image('kirby', 'assets/kirby.png');
        this.load.image('kirbychocolate', 'assets/kirbychocolate.png');
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('ice', 'assets/ice-platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.spritesheet('dude', 'assets/dude.png', 32, 48);

        //game.load.audio('music', 'assets/music/tommy_in_goa.mp3');
        this.load.audio('music', 'assets/music/oedipus_ark_pandora.mp3');
        this.load.audio('pickup', 'assets/sounds/p-ping.mp3');
        //this.load.audio('leveldone', 'assets/sounds/lazer_off_wall.mp3');
        this.load.audio('scary', 'assets/sounds/magical_horror_audiosprite.mp3');
    },

    create: function() {game.physics.startSystem(Phaser.Physics.ARCADE);
        this.music = game.add.audio('music');
        this.music.play();

        this.pickup = game.add.audio("pickup");
        this.leveldone = game.add.audio("leveldone");

        // A simple background for our game
        game.add.sprite(0, 0, 'sky');

        this.addGround();
        this.addPlayer();
        this.addStars();

        // The score label
        this.scoreText = game.add.text(4, 4, 'Score 0', { fontSize: '16px', fill: '#000' });

        // Our controls.
        this.cursors = game.input.keyboard.createCursorKeys();
    },

    addGround: function () {

        function addLedge(platforms, left, top, width) {
            var ledge = platforms.create(left, top, 'ice');
            ledge.scale.setTo(width, .3);
            ledge.body.immovable = true;
        }


        //  The platforms group contains the ground and the 2 ledges we can jump on
        //platforms = game.add.group();
        this.platforms = game.add.physicsGroup();
        this.floor = game.add.physicsGroup();

        //  We will enable physics for any object that is created in this group
        this.platforms.enableBody = true;
        this.floor.enableBody = true;
        
        addLedge(this.floor, 0, game.world.height - 10, 6.2)

        var width = .9;
        addLedge(this.platforms, 200, 100, width);
        addLedge(this.platforms, 250, 250, width);
        addLedge(this.platforms, 350, 500, width);
        addLedge(this.platforms, 450, 200, width);
        addLedge(this.platforms, 550, 400, width);
        addLedge(this.platforms, 650, 300, width);
        addLedge(this.platforms, 650, 150, width);

        this.platforms.setAll('body.allowGravity', false);
        this.platforms.setAll('body.immovable', true);
        this.platforms.setAll('body.velocity.x', -50);
    },

    addPlayer: function() {
        // The player and its settings
        //player = game.add.sprite(32, game.world.height - 150, 'dude');
        this.player = game.add.sprite(32, game.world.height - 150, 'kirby');

        //  We need to enable physics on the player
        game.physics.arcade.enable(this.player);

        //  Player physics properties. Give the little guy a slight bounce.
        this.player.body.bounce.y = 0.2;
        this.player.body.gravity.y = 500;
        this.player.body.collideWorldBounds = true;

        //  Our two animations, walking left and right.
        this.player.animations.add('left', [0, 1, 2, 3], 10, true);
        this.player.animations.add('right', [5, 6, 7, 8], 10, true);
    },

    addStars: function() {
        this.stars = game.add.group();

        //  We will enable physics for any star that is created in this group
        this.stars.enableBody = true;

        //  Here we'll create 12 of them evenly spaced apart
        for (var i = 0; i < this.prizesTotal; i++) {
            //  Create a star inside of the 'stars' group
            var star = this.stars.create(i * 35, 0, 'star');
            //  Let gravity do its thing
            star.body.gravity.y = 200;
            //  This just gives each star a slightly random bounce value
            star.body.bounce.y = 0.4 + Math.random() * 0.2;
        }
    },

    update: function() {

        //platforms.forEach(wrapPlatform, this);

        //  Collide the player and the stars with the platforms
        game.physics.arcade.collide(this.player, this.platforms);
        game.physics.arcade.collide(this.stars, this.platforms);

        game.physics.arcade.collide(this.player, this.floor);
        game.physics.arcade.collide(this.stars, this.floor);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        game.physics.arcade.overlap(this.player, this.stars, this.collectStar, null, this);

        //  Reset the players velocity (movement)
        this.player.body.velocity.x = 0;

        if (this.cursors.left.isDown) {
            //  Move to the left
            this.player.body.velocity.x = -150;
            this.player.animations.play('left');
        }
        else if (this.cursors.right.isDown) {
            //  Move to the right
            this.player.body.velocity.x = 150;
            this.player.animations.play('right');
        }
        else {
            //  Stand still
            this.player.animations.stop();
            this.player.frame = 4;
        }

        //  Allow the player to jump if they are touching the ground.
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.body.velocity.y = -350;
        }

        this.frameCount++;
        if (this.frameCount % 100 == 0) {
            if (this.frameCount % 200 == 0)
                this.platforms.setAll('body.velocity.x', 50);
            else
                this.platforms.setAll('body.velocity.x', -50);
        }
    },

    collectStar: function(player, star) {
        
        // Removes the star from the screen
        star.kill();
        this.pickup.play();

        //  Add and update the score
        this.score += 10;
        this.scoreText.text = 'Score ' + this.score;

        this.prizesPickedUp++;
        if (this.prizesPickedUp == this.prizesTotal)
            this.endLevel();
    },

    endLevel: function () {
        this.music.stop();
        this.leveldone.play();
    }
}

game.state.add('Game', Kirby, true);

