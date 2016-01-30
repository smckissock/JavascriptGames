var game = new Phaser.Game(640, 480, Phaser.AUTO, 'game');

var PhaserGame = function (game) {

    this.layer = null;
    this.player = null;

    this.flipTween = null;

    this.leftZone = new Phaser.Rectangle(-32, 0, 32, 480);
    this.rightZone = new Phaser.Rectangle(640, 0, 32, 480);
    
    this.ladder = [ 359, 389, 449, 419, 212, 242, 272, 302, 182 ];

};

PhaserGame.prototype = {

    init: function () {

        this.scale.pageAlignHorizontally = true;

        this.physics.startSystem(Phaser.Physics.ARCADE);
        this.physics.arcade.gravity.y = 300;
    },

    preload: function () {
        this.load.image('tiles', 'assets/tiles.png');
        this.load.image('sky', 'assets/sky.png');

        this.load.tilemap('map', 'assets/willkai.json', null, Phaser.Tilemap.TILED_JSON);
        //this.load.tilemap('map', 'js/map.json', null, Phaser.Tilemap.TILED_JSON);
       
        this.load.spritesheet('wizard', 'assets/wizard.png', 32, 32);
        //this.load.image('wizard', 'kirby.png', 32, 32);

        this.load.audio('music', 'assets/music/Totta-HeroQuest-Pophousedub-remix.mp3');
    },

    create: function () {
        this.music = game.add.audio('music');
        this.music.play();

        var sky = this.add.sprite(0, 0, 'sky');
        sky.fixedToCamera = true;

        this.map = this.add.tilemap('map');
        this.map.addTilesetImage('fantasy_tiles_by_surt', 'tiles');

        this.layer = this.map.createLayer('Tile Layer 1');
        this.layer.resizeWorld();

        this.map.setCollision([138, 139, 140, 141, 168, 169, 170, 171, 181, 198, 199, 200, 201, 218,
            224, 225, 226, 227, 254, 255, 256, 257,
            247, 248, 251, 225,
            305, 306, 307, 308, 335, 336, 337, 338, 365, 366, 367, 368, 397,
            312, 313, 315, 316, 317, 318, 319,
            342, 343, 345, 346, 347, 348, 349,
            328, 352, 353, 354, 355, 356, 357, 358, 360, 382, 383, 384,
            412, 413, 414, 415, 416, 417, 418, 442, 443, 443, 445, 446, 447, 448, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480,
            511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538, 539, 540,
            541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553, 554, 555, 556, 557, 558, 559, 560, 561, 562, 563, 564, 565, 566, 567, 568, 569, 570,
            571, 572, 573, 574, 575, 576
        ]);

        //this.layer.debug = true;
        this.player = game.add.sprite(32, game.world.height - 150, 'wizard');

        this.player.animations.add('right', [0,1,2,3,4,5,6,7], 8, true);
        this.player.animations.add('left', [8,9,10,11,12,13,14,15], 8, true);

        this.physics.arcade.enable(this.player);

        this.player.body.setSize(28, 32, 0, 0);
        this.player.body.collideWorldBounds = true;
        this.player.body.gravity.y = 500;

        this.cursors = this.input.keyboard.createCursorKeys();
    },

    update: function () {
        this.physics.arcade.collide(this.player, this.layer);

        // Don't move - we are scrolling
        if (this.flipTween && this.flipTween.isRunning)
            return;
                
        // Move left or right
        this.player.body.velocity.x = 0;
        if (this.cursors.left.isDown) {
            this.player.body.velocity.x = -200;
            this.player.play('left');
        }
        else if (this.cursors.right.isDown) {
            this.player.body.velocity.x = 200;
            this.player.play('right');
        }
        else 
            this.player.animations.stop();
        
        var onLadder = this.onLadder();
        if (this.cursors.up.isDown && onLadder) 
            this.player.body.velocity.y = -100;
        else if (this.cursors.down.isDown && onLadder) 
            this.player.body.velocity.y = 100;
        
        if (!onLadder) {
            //  Allow the player to jump if they are touching the ground.
            if (this.cursors.up.isDown && this.player.body.onFloor()) 
                this.player.body.velocity.y = -420;
        }

        if (this.player.body.velocity.x > 0 && this.player.x >= this.rightZone.x)
            this.flipRight();
        else if (this.player.body.velocity.x < 0 && this.player.x <= this.leftZone.right)
            this.flipLeft();
    },

    flipLeft: function () {
        if (this.camera.x === 0)
            return;
        
        this.leftZone.x -= 640;
        this.rightZone.x -= 640;
        this.flipTween = this.add.tween(this.camera).to( { x: "-640" }, 500, "Linear", true);
    },

    flipRight: function () {
        if (this.camera.x === this.game.world.width - 640)
            return;
        
        this.leftZone.x += 640;
        this.rightZone.x += 640;
        this.flipTween = this.add.tween(this.camera).to( { x: "+640" }, 500, "Linear", true);
    },

    onLadder: function () {
        var x = this.layer.getTileX(this.player.x);
        var y = this.layer.getTileY(this.player.y);
        var tile = this.map.getTile(x, y, this.layer);

        return (tile !== null && this.ladder.indexOf(tile.index) > -1);
    }
};

game.state.add('Game', PhaserGame, true);
