// --- Configuration ---
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const DESIGN_WIDTH = 800;
const DESIGN_HEIGHT = 300;
const MAX_GAME_WIDTH = 1200; // Maximum width the game should ever be

const config = {
  type: Phaser.AUTO,
  width: DESIGN_WIDTH,
  height: DESIGN_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    parent: "phaser-game",
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    max: {
      width: MAX_GAME_WIDTH,
      height: DESIGN_HEIGHT * (MAX_GAME_WIDTH / DESIGN_WIDTH)
    }
  },
  parent: "phaser-game", // This is now handled by scale.parent, but doesn't hurt to leave
  backgroundColor: "#535353", // Dino game dark background
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 }, // Gravity pulling things down
      debug: false, // SET TO true TO SEE HITBOXES FOR DEBUGGING
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  input: {
    activePointers: 3,
    keyboard: true, // Ensure keyboard input is enabled
  },
};

// --- Global Variables ---
let player;
let cursors; // RE-ADDED for keyboard
let ground;
let spaceKey; // RE-ADDED for keyboard
let scoreText;
let highScoreText; // NEW: High score text display
let score = 0;
// --- FIX: Load high score from localStorage at startup ---
let highScore = parseInt(localStorage.getItem('HighScore'), 10) || 0;
let isDucking = false;
let duckTween = null;
let webs;
let webSpawnTimer;
let spiders;
let spiderSpawnTimer;
let gameOverText;
let isGameOver = false;
// let sprintIndicatorIcon; // REMOVED
let duckButton;
let sprintButton;
let sprintButtonText = null; // REMOVED text reference
let jumpButton; // NEW: On-screen jump button
let isDuckButtonPressed = false;
let jumpInputFlag = false; // Still used for touch jump button
let doubleJumpCooldownBarBg = null; // NEW: Cooldown bar background
let doubleJumpCooldownBar = null;   // NEW: Cooldown bar fill
let doubleJumpCooldownBarTimer = 0; // NEW: For animation
let startMenuContainer = null; // NEW: Start menu UI container
let isGameStarted = false;     // NEW: Track if game has started

// --- Player Constants & State ---
const PLAYER_START_Y = config.height * 0.85;
const PLAYER_SPRITE_WIDTH = 48;
const PLAYER_SPRITE_HEIGHT = 48;
// --- Make hitbox smaller and tighter to sprite, but scale sprite up ---
const PLAYER_PHYSICS_NORMAL_WIDTH = 12; // Was 18, now thinner
const PLAYER_PHYSICS_NORMAL_HEIGHT = 38;
// Make duck hitbox about 2/3 of standing height (not half)
const PLAYER_PHYSICS_DUCK_HEIGHT = 25;    // was 18
// Scale up the player sprite visually (e.g., 66px wide as before)
const PLAYER_TARGET_SCALED_WIDTH = 66;
const PLAYER_SCALE_FACTOR = PLAYER_TARGET_SCALED_WIDTH / PLAYER_SPRITE_WIDTH;
const PLAYER_SCALED_NORMAL_HEIGHT = PLAYER_SPRITE_HEIGHT * PLAYER_SCALE_FACTOR;
const PLAYER_SCALED_DUCK_HEIGHT = PLAYER_SCALED_NORMAL_HEIGHT / 2;
const PLAYER_COLOR = 0xf7f7f7;
const GROUND_LEVEL = config.height * 0.9;
let scrollSpeed = 3.0;
let isSlowed = false;
// --- Web Slowdown State ---
let webSlowState = "none";
let webSlowTimer = 0;
const WEB_SLOW_ENTER_DURATION = 80;
const WEB_SLOW_STUCK_DURATION = 400;
const WEB_SLOW_RECOVER_DURATION = 500;
let webSlowAmount = 0;
const WADING_PUSHBACK_FACTOR = 0.7;
let totalGroundWidth;
let numTiles;
const PLAYER_MAX_X = config.width * 0.75;
let webStuckY = null;

// --- Player State Variables for Juice ---
let wasTouchingGround = false;
const JUMP_VELOCITY = -700;
// --- Double Jump Variables --- START ---
const DOUBLE_JUMP_VELOCITY = -650; // Slightly stronger than before
const DOUBLE_JUMP_COOLDOWN_DURATION = 2500; // 2.5 second cooldown
const COOLDOWN_BAR_BG_COLOR = 0x333333;
const COOLDOWN_BAR_READY_COLOR = 0x00ff00; // Green when ready
const COOLDOWN_BAR_COOLDOWN_COLOR = 0xff3333; // Red during cooldown
let jumpsAvailable = 2;
let doubleJumpCooldownActive = false;
let doubleJumpCooldownTimer = null;
let canDoubleJump = true; // NEW: Track if double jump is available
// --- Double Jump Variables --- END ---


// --- Web Constants ---
const WEB_COLOR = 0x00ff00;
const WEB_SIZE = 45;
const WEB_WIDTH = WEB_SIZE;
const WEB_HEIGHT = WEB_SIZE;
const WEB_SPAWN_DELAY_MIN = 1500;
const WEB_SPAWN_DELAY_MAX = 3000;

// --- Web Slowdown After Score 400 ---
const WEB_SLOWDOWN_START_SCORE = 400;
const WEB_SLOWDOWN_FACTOR_PER_POINT = 0.0006;
const MAX_WEB_SLOWDOWN_MULTIPLIER = 1.75;

// --- Spider Constants ---
const SPIDER_COLOR = 0xff0000;
const SPIDER_SIZE = 20;
const SPIDER_DISPLAY_SIZE = 40; // NEW: Size for visual display
const SPIDER_GROUND_OFFSET = 10; // NEW: How far below ground level spiders should sit
const SPIDER_SPAWN_DELAY_MIN = 3200;
const SPIDER_SPAWN_DELAY_MAX = 6000;
const SPIDER_HORIZONTAL_SPEED_FACTOR = 1.3;
const SPIDER_FALL_SPEED = 150;
const SPIDER_VERTICAL_TRACKING_SPEED = 120;
const SPIDER_TRACKING_X_THRESHOLD = 60;  // Increased from 30
const SPIDER_WEB_LINE_COLOR = 0xffffff;
const SPIDER_WEB_LINE_WIDTH = 1;
const SPIDER_TRACKING_X_RANDOM_RANGE = 80; // Increased for wider movement
const SPIDER_TRACKING_Y_RANDOM_RANGE = 30; // Increased vertical range
const SPIDER_RANDOM_JUMP_CHANCE = 0.01;    // 1% chance to jump per frame when tracking
const SPIDER_JUMP_VELOCITY = -350;         // Adjusted for better feel
const SPIDER_MOVEMENT_SMOOTHING = 0.05;  // Made smoother
const SPIDER_MAX_JUMP_HEIGHT = 140;      // Slightly higher jumps allowed
const SPIDER_JUMP_MIN_DIST = 20;         // NEW: Minimum distance before spider jump when tracking
const POWERUP_WEB_SAFE_DISTANCE = 100; // NEW: Minimum distance from webs

// --- Invincibility Power-up Variables & Constants --- START ---
let invincibilityPowerUps;
let hasInvincibilityPowerUp = false;
let isInvincible = false;
let invincibilityDurationTimer = null;

const INVINCIBILITY_POWERUP_COLOR = 0xffff00;
const INVINCIBILITY_POWERUP_SIZE = 25;
const INVINCIBILITY_DISTANCE_MIN = 1200; // Minimum distance between spawns (pixels)
const INVINCIBILITY_DISTANCE_MAX = 3000; // Maximum distance between spawns (pixels)
let invincibilityDistanceThreshold = 0; // Distance to next spawn
let invincibilityDistanceSinceLast = 0; // Distance since last spawn
const INVINCIBILITY_DURATION = 750;
const INVINCIBILITY_FORWARD_VELOCITY = 300;
const POWERUP_RETRY_DELAY = 1000; // NEW: Shorter delay for retry when blocked by webs
// --- Invincibility Power-up Variables & Constants --- END ---

// --- UI Constants ---
const BUTTON_SIZE = 70; // Slightly larger
const BUTTON_MARGIN = 20;
const BUTTON_COLOR = 0x444444; // Darker base color
const BUTTON_ALPHA = 0.85; // More opaque
const BUTTON_ACTIVE_ALPHA = 1;
const BUTTON_BORDER_COLOR = 0x666666;
const BUTTON_BORDER_WIDTH = 2;
const BUTTON_RADIUS = 16; // Rounded corners

// --- Game Instance ---
const game = new Phaser.Game(config);

// --- Fullscreen and Orientation Handling ---
window.addEventListener('load', function() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    
    // Only show fullscreen button on mobile devices that support fullscreen
    if (isMobile && (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)) {
        fullscreenBtn.style.display = 'block';
        
        fullscreenBtn.addEventListener('click', async function() {
            if (!document.fullscreenElement) {
                // Request fullscreen
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    await document.documentElement.webkitRequestFullscreen();
                }
                
                // Lock to landscape if supported
                if (screen.orientation && screen.orientation.lock) {
                    try {
                        await screen.orientation.lock('landscape');
                    } catch (error) {
                        console.log('Orientation lock failed:', error);
                    }
                }
                
                document.body.classList.add('fullscreen');
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                document.body.classList.remove('fullscreen');
            }
        });
    }
    
    // Handle fullscreen change
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    
    function handleFullscreenChange() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            document.body.classList.remove('fullscreen');
            fullscreenBtn.style.display = 'block'; // Show button when exiting fullscreen
            // Unlock orientation if it was locked
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
            }
        } else {
            fullscreenBtn.style.display = 'none'; // Hide button when entering fullscreen
        }
    }
});

// --- Scene Functions ---

function preload() {
  // Ensure VT323 font is loaded before creating text
  this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  
  console.log("Preloading assets...");
  this.load.spritesheet('player', 'assets/player_spritesheet.png', {
    frameWidth: 48,
    frameHeight: 48
  });
  // NEW: Load cobweb image for webs
  this.load.image('cobweb', 'assets/cobweb.png');
  this.load.image('spider', 'assets/spider.png');
  this.load.image('arrow', 'assets/arrow.png');
  // --- NEW: Load power-up icon ---
  this.load.image('power', 'assets/power.png');
}

function create() {
  // Load VT323 font before creating any text
  WebFont.load({
    google: {
      families: ['VT323']
    },
    active: () => {
      // Continue with game creation after font is loaded
      this.events.emit('fontsloaded');
    }
  });

  this.events.once('fontsloaded', () => {
    // Add this to ensure proper scaling on orientation changes
    this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
        this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    });

    console.log("Creating game objects...");
    const gameWidth = config.width;
    const gameHeight = config.height;
    isGameOver = false;
    isSlowed = false;
    webSlowState = "none";
    webSlowTimer = 0;
    webSlowAmount = 0;
    scrollSpeed = 3.0;
    score = 0;
    hasInvincibilityPowerUp = false;
    isInvincible = false;
    isDuckButtonPressed = false;
    jumpInputFlag = false;
    // Reset double jump state
    jumpsAvailable = 2;
    doubleJumpCooldownActive = false;
    canDoubleJump = true; // Reset double jump availability
    if (doubleJumpCooldownTimer) {
      doubleJumpCooldownTimer.remove();
      doubleJumpCooldownTimer = null;
    }


    if (invincibilityDurationTimer) {
      invincibilityDurationTimer.remove();
      invincibilityDurationTimer = null;
    }

    isGameStarted = false; // NEW: Not started until menu dismissed

    // --- Ground ---
    ground = this.physics.add.staticGroup();
    const groundTileWidth = gameWidth;
    const groundHeight = 3;
    numTiles = 2;
    totalGroundWidth = numTiles * groundTileWidth;
    for (let i = 0; i < numTiles; i++) {
      const tile = this.add.rectangle(
        i * groundTileWidth,
        GROUND_LEVEL + groundHeight / 2,
        groundTileWidth,
        groundHeight,
        PLAYER_COLOR
      );
      tile.setOrigin(0, 0.5);
      ground.add(tile);
      tile.body.setSize(groundTileWidth, groundHeight).setOffset(0, 0);
    }

    // --- Player ---
    // Use sprite with animation
    player = this.add.sprite(
      gameWidth * 0.45,
      PLAYER_START_Y,
      'player',
      4
    );
    this.physics.add.existing(player);
    if (player.body) {
      player.body.setGravityY(config.physics.arcade.gravity.y);
      player.body.setCollideWorldBounds(false);
      // --- Set smaller, centered hitbox ---
      player.body.setSize(PLAYER_PHYSICS_NORMAL_WIDTH, PLAYER_PHYSICS_NORMAL_HEIGHT);
      player.body.setOffset(
        (player.width - PLAYER_PHYSICS_NORMAL_WIDTH) / 2,
        player.height - PLAYER_PHYSICS_NORMAL_HEIGHT - 6
      );
      player.body.setMaxVelocityX(INVINCIBILITY_FORWARD_VELOCITY * 1.5);
    } else {
      console.error("Player physics body not created!");
    }
    player.setScale(PLAYER_SCALE_FACTOR);
    player.setOrigin(0.5, 1);
    player.y = GROUND_LEVEL + 6;

    // --- Player Animation ---
    // Right-facing run: row 1 (frames 4,5,6,7)
    this.anims.create({
      key: 'player_run',
      frames: this.anims.generateFrameNumbers('player', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    // --- Webs Group ---
    webs = this.physics.add.group({
      allowGravity: false,
      immovable: true,
    });

    // --- Spiders Group ---
    spiders = this.physics.add.group({
      allowGravity: false,
    });

    // --- Invincibility Power-up Group ---
    invincibilityPowerUps = this.physics.add.group({
      allowGravity: false,
      immovable: false,
    });

    // --- Score ---
    // Just update the display
    highScoreText = this.add.text(config.width - 300, 20, "HIGH: " + Math.floor(highScore), {
      fontSize: "24px",
      fill: "#f7f7f7",
      fontFamily: "VT323"
    });
    highScoreText.setOrigin(0, 0).setDepth(5).setScrollFactor(0);

    // Current score on the right
    scoreText = this.add.text(config.width - 150, 20, "SCORE: 0", {
      fontSize: "24px",
      fill: "#f7f7f7",
      fontFamily: "VT323"
    });
    scoreText.setOrigin(0, 0).setDepth(5).setScrollFactor(0);

    // --- Sprint Indicator Icon --- REMOVED

    // --- Game Over Text ---
    gameOverText = this.add.text(
      gameWidth / 2,
      gameHeight / 2,
      "GAME OVER\nTap/Click to Restart", // Updated text
      {
        fontSize: "48px",
        fill: "#ff0000",
        fontFamily: "VT323",
        align: "center",
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setVisible(false);
    gameOverText.setDepth(10);
    gameOverText.setScrollFactor(0);

    // --- Collisions ---
    this.physics.add.collider(player, ground, () => {
      // Ensure player stays on ground after landing
      if (player.body.blocked.down) {
        player.body.setVelocityY(0);
        player.body.setAllowGravity(true);
      }
    });
    this.physics.add.overlap(player, webs, hitWeb, null, this);
    this.physics.add.overlap(player, spiders, hitSpider, null, this);
    this.physics.add.overlap(
      player,
      invincibilityPowerUps,
      collectInvincibilityPowerUp,
      null,
      this
    );

    // --- Input ---
    // Keyboard Input Setup (RE-ADDED)
    cursors = this.input.keyboard.createCursorKeys();
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // --- Touch Input Setup ---
    const createGameButton = (scene, x, y, color, iconKey) => {
      const button = scene.add.container(x, y).setDepth(10).setScrollFactor(0);

      const bg = scene.add.rectangle(0, 0, BUTTON_SIZE, BUTTON_SIZE, color, BUTTON_ALPHA)
          .setInteractive()
          .setOrigin(0.5);

      // Add rounded corners and border
      bg.setStrokeStyle(BUTTON_BORDER_WIDTH, BUTTON_BORDER_COLOR);
      bg.radius = BUTTON_RADIUS;
      bg.iterations = 32; // Smooth corners

      button.add(bg);
      button.bg = bg;

      // --- Add icon if provided ---
      if (iconKey) {
        const icon = scene.add.image(0, 0, iconKey)
          .setScale(0.25) // Set to 0.25 as requested
          .setOrigin(0.5);
        button.add(icon);
        button.icon = icon;
      }

      return button;
    };

    // Duck Button
    duckButton = createGameButton(
      this,
      BUTTON_MARGIN + BUTTON_SIZE / 2,
      gameHeight - BUTTON_MARGIN - BUTTON_SIZE / 2,
      BUTTON_COLOR,
      'arrow'
    );
    duckButton.icon.setAngle(180); // Flip arrow to point down

    // Jump Button
    jumpButton = createGameButton(
      this,
      gameWidth - BUTTON_MARGIN - BUTTON_SIZE / 2,
      gameHeight - BUTTON_MARGIN - BUTTON_SIZE / 2,
      BUTTON_COLOR,
      'arrow'
    );
    // Up arrow (default orientation)

    // Sprint/Power Button (now gray, not yellow, and uses power icon)
    const sprintButtonX =
      jumpButton.x - BUTTON_SIZE - BUTTON_MARGIN / 2; // Position left of Jump
    sprintButton = createGameButton(
      this,
      sprintButtonX,
      gameHeight - BUTTON_MARGIN - BUTTON_SIZE / 2,
      BUTTON_COLOR, // Use BUTTON_COLOR (gray), not yellow
      'power'
    );
    sprintButtonText = null;
    sprintButton.setVisible(false);

    // Duck Button Listeners
    duckButton.bg.on("pointerdown", () => {
      isDuckButtonPressed = true;
      // --- Tween: scale up and fade in alpha ---
      duckButton.bg.setAlpha(BUTTON_ACTIVE_ALPHA);
      duckButton.setScale(1.13);
      this.tweens.add({
        targets: duckButton,
        scale: 1.0,
        duration: 120,
        ease: "Back.easeOut"
      });
      this.tweens.add({
        targets: duckButton.bg,
        alpha: BUTTON_ACTIVE_ALPHA,
        duration: 60,
        yoyo: true,
        repeat: 0
      });
      // // Play sound here if available:
      // this.sound.play('button_press');
    });
    duckButton.bg.on("pointerout", () => {
      isDuckButtonPressed = false;
      duckButton.bg.setAlpha(BUTTON_ALPHA);
      duckButton.setScale(1.0);
    });
    // Global pointer up handles duck release as well
    this.input.on("pointerup", (pointer) => {
      // Check if the pointer that went up was the one pressing the duck button
      if (
        pointer.downX >= duckButton.x - BUTTON_SIZE / 2 &&
        pointer.downX <= duckButton.x + BUTTON_SIZE / 2 &&
        pointer.downY >= duckButton.y - BUTTON_SIZE / 2 &&
        pointer.downY <= duckButton.y + BUTTON_SIZE / 2
      ) {
        isDuckButtonPressed = false;
        duckButton.bg.setAlpha(BUTTON_ALPHA);
        duckButton.setScale(1.0);
      }
      // Reset jump button visual if pointer up happens anywhere
      if (jumpButton.bg.alpha === BUTTON_ACTIVE_ALPHA) {
          jumpButton.bg.setAlpha(BUTTON_ALPHA);
          jumpButton.setScale(1.0);
      }
    });

    // Jump Button Listener (Tap to Jump)
    jumpButton.bg.on("pointerdown", () => {
      jumpInputFlag = true; // Signal a jump attempt for the update loop
      // --- Tween: scale up and fade in alpha ---
      jumpButton.bg.setAlpha(BUTTON_ACTIVE_ALPHA);
      jumpButton.setScale(1.13);
      this.tweens.add({
        targets: jumpButton,
        scale: 1.0,
        duration: 120,
        ease: "Back.easeOut"
      });
      this.tweens.add({
        targets: jumpButton.bg,
        alpha: BUTTON_ACTIVE_ALPHA,
        duration: 60,
        yoyo: true,
        repeat: 0
      });
      // // Play sound here if available:
      // this.sound.play('button_press');
    });
    jumpButton.bg.on("pointerout", () => {
        if (jumpButton.bg.alpha === BUTTON_ACTIVE_ALPHA) {
            jumpButton.bg.setAlpha(BUTTON_ALPHA);
        }
        jumpButton.setScale(1.0);
    });

    // Sprint Button Listener (Tap to Activate Invincibility)
    sprintButton.bg.on("pointerdown", () => {
      // Only try to activate if the button is actually visible and conditions met
      if (sprintButton.visible) {
        // --- Tween: scale up and fade in alpha ---
        sprintButton.bg.setAlpha(BUTTON_ACTIVE_ALPHA);
        sprintButton.setScale(1.13);
        this.tweens.add({
          targets: sprintButton,
          scale: 1.0,
          duration: 120,
          ease: "Back.easeOut"
        });
        this.tweens.add({
          targets: sprintButton.bg,
          alpha: BUTTON_ACTIVE_ALPHA,
          duration: 60,
          yoyo: true,
          repeat: 0
        });
        // // Play sound here if available:
        // this.sound.play('button_press');
        startInvincibility.call(this); // startInvincibility already checks conditions
      }
    });
    sprintButton.bg.on("pointerout", () => {
      sprintButton.setScale(1.0);
    });

    // Global Tap/Click Listener (Restart Only)
    this.input.on("pointerdown", (pointer) => {
      if (isGameOver) {
        // Check if the tap started on one of the UI buttons
        const isTapOnDuckButton = duckButton
          .getBounds()
          .contains(pointer.x, pointer.y);
        const isTapOnJumpButton = jumpButton
          .getBounds()
          .contains(pointer.x, pointer.y);
        const isTapOnSprintButton =
          sprintButton.visible &&
          sprintButton.getBounds().contains(pointer.x, pointer.y);

        // Only restart if tap is NOT on an active button
        if (!isTapOnDuckButton && !isTapOnJumpButton && !isTapOnSprintButton) {
          console.log("Restarting game via tap/click...");
          if (duckTween) duckTween.stop();
          player.displayHeight = PLAYER_PHYSICS_NORMAL_HEIGHT;
          isDucking = false;
          isDuckButtonPressed = false;
          duckTween = null;
          spiders.children.iterate((spider) => {
            if (spider && spider.webLine) {
              spider.webLine.destroy();
              spider.webLine = null;
            }
          });
          this.scene.restart();
        }
        // If game over and tap *was* on a button, do nothing extra here
      }
      // Removed jump logic from global tap
    });

    // --- Spawning Timers ---
    scheduleNextWebSpawn.call(this);
    scheduleNextSpiderSpawn.call(this);

    // --- Power-up Distance-based Spawning ---
    invincibilityDistanceSinceLast = 0;
    invincibilityDistanceThreshold = Phaser.Math.Between(INVINCIBILITY_DISTANCE_MIN, INVINCIBILITY_DISTANCE_MAX);

    // --- Initialize Player State ---
    wasTouchingGround = false; // Initialize wasTouchingGround

    // --- Double Jump Cooldown Bar (indicator) ---
    doubleJumpCooldownBarBg = this.add.rectangle(
      jumpButton.x,
      jumpButton.y - BUTTON_SIZE / 2 - 15, // Position ABOVE jump button
      60,
      8,
      COOLDOWN_BAR_BG_COLOR,
      0.7
    ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(100).setVisible(true);

    doubleJumpCooldownBar = this.add.rectangle(
      jumpButton.x,
      jumpButton.y - BUTTON_SIZE / 2 - 15, // Match background position
      60,
      8,
      COOLDOWN_BAR_READY_COLOR,
      0.85
    ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(101).setVisible(true);

    // Add "DOUBLE JUMP" text below the cooldown bar
    this.add.text(
      jumpButton.x,
      jumpButton.y - BUTTON_SIZE / 2 - 25, // Position above the bar
      "DOUBLE JUMP",
      {
        fontSize: "16px",
        fill: "#ffffff",
        fontFamily: "VT323"
      }
    ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(101);

    // --- Start Menu Overlay --- (Simplified)
    if (!window._dallinGameHasShownMenu) {
      startMenuContainer = this.add.container(0, 0).setDepth(1000).setScrollFactor(0);

      // Simple dark overlay
      const menuBg = this.add.rectangle(
        0, 0, config.width, config.height,
        0x000000, 0.7
      ).setOrigin(0, 0);

      // Centered "CLICK ANYWHERE TO START" text
      const startText = this.add.text(
        config.width / 2,
        config.height / 2 - 18,
        "CLICK ANYWHERE TO START",
        {
          fontSize: "28px",
          fill: "#fff",
          fontFamily: '"Press Start 2P", monospace',
          align: "center"
        }
      ).setOrigin(0.5);

      // Minimal, smaller, simpler instructions lower down
      const instructions = this.add.text(
        config.width / 2,
        config.height - 54,
        [
          "Jump: UP / SPACE / JUMP",
          "Duck: DOWN / DUCK",
          "Double Jump: In air, jump again",
          "Power: Collect, then press RIGHT or POWER"
        ].join('\n'),
        {
          fontSize: "13px",
          fill: "#cccccc",
          fontFamily: '"Press Start 2P", monospace',
          align: "center",
          lineSpacing: 6,
          wordWrap: { width: config.width * 0.92 }
        }
      ).setOrigin(0.5);

      startMenuContainer.add([menuBg, startText, instructions]);

      // Dismiss menu on any pointerdown
      this.input.once("pointerdown", () => {
        startMenuContainer.setVisible(false);
        isGameStarted = true;
        spawnTrackingSpiders.call(this, 3);
        this.physics.resume();
        window._dallinGameHasShownMenu = true;
      });

      // Pause physics until game starts
      this.physics.pause();
    } else {
      isGameStarted = true;
      spawnTrackingSpiders.call(this, 3);
      this.physics.resume();
    }

    console.log("Game created!");
  });
}

// --- Helper: Spawn spiders already tracking the player --- NEW
function spawnTrackingSpiders(count) {
  const startXs = [
    config.width * 0.05,
    config.width * 0.12,
    config.width * 0.19
  ];
  for (let i = 0; i < 3; i++) {
    const spawnX = startXs[i];
    const spawnY = GROUND_LEVEL - SPIDER_DISPLAY_SIZE / 2 + SPIDER_GROUND_OFFSET;
    const spider = this.add.image(spawnX, spawnY, 'spider')
      .setOrigin(0.5, 0.5);
    spider.displayWidth = SPIDER_DISPLAY_SIZE;
    spider.displayHeight = SPIDER_DISPLAY_SIZE;
    spiders.add(spider);
    if (!spider.body) {
      this.physics.world.enable(spider);
    }
    // --- Hitbox: half as tall, shifted halfway right and halfway down ---
    const hitboxWidth = 600;
    const hitboxHeight = 300;
    spider.body.setSize(hitboxWidth, hitboxHeight);
    spider.body.setOffset(
      (spider.displayWidth - hitboxWidth) / 2 + hitboxWidth / 2,
      (spider.displayHeight - hitboxHeight) / 2 + hitboxHeight / 2
    );
    spider.isOnGround = true;
    spider.isTracking = true;
    spider.preferredX = Phaser.Math.Between(
      SPIDER_TRACKING_X_THRESHOLD,
      SPIDER_TRACKING_X_THRESHOLD * 2
    );
    spider.trackingMobOffsetX = Phaser.Math.Between(
      -SPIDER_TRACKING_X_RANDOM_RANGE,
      SPIDER_TRACKING_X_RANDOM_RANGE
    );
    spider.trackingMobOffsetY = Phaser.Math.Between(
      -SPIDER_TRACKING_Y_RANDOM_RANGE,
      SPIDER_TRACKING_Y_RANDOM_RANGE
    );
    spider.individualOffset = Math.random() * Math.PI * 2;
    spider.movementSpeed = 0.001 + Math.random() * 0.001;
    spider.webLine = null;
  }
}

// --- Web Spawning ---
function scheduleNextWebSpawn() {
  if (isGameOver) return;
  const speedFactor = Math.max(scrollSpeed / 3.0, 1);
  const baseMinDelay = WEB_SPAWN_DELAY_MIN / speedFactor;
  const baseMaxDelay = WEB_SPAWN_DELAY_MAX / speedFactor;

  let scoreSlowdownMultiplier = 1.0;
  if (score > WEB_SLOWDOWN_START_SCORE) {
    scoreSlowdownMultiplier = 1.0 + (score - WEB_SLOWDOWN_START_SCORE) * WEB_SLOWDOWN_FACTOR_PER_POINT;
    scoreSlowdownMultiplier = Math.min(scoreSlowdownMultiplier, MAX_WEB_SLOWDOWN_MULTIPLIER);
  }

  const finalMinDelay = baseMinDelay * scoreSlowdownMultiplier;
  const finalMaxDelay = baseMaxDelay * scoreSlowdownMultiplier;
  const delay = Phaser.Math.Between(finalMinDelay, finalMaxDelay);

  if (webSpawnTimer) webSpawnTimer.remove();
  webSpawnTimer = this.time.delayedCall(delay, spawnWeb, [], this);
}
function spawnWeb() {
  if (isGameOver) return;
  const gameWidth = config.width;
  const spawnX = gameWidth + 50;
  let webY;
  const webHeight = WEB_HEIGHT;
  if (Phaser.Math.Between(0, 1) === 0) {
    webY = GROUND_LEVEL - webHeight / 2;
  } else {
    webY = GROUND_LEVEL - PLAYER_PHYSICS_DUCK_HEIGHT - webHeight / 2 - 15;
  }
  // --- Use cobweb.png sprite for webs, scale up for margin, fix hitbox ---
  const SCALE_FACTOR = 1.35;
  const web = this.add.image(
    spawnX,
    webY,
    'cobweb'
  );
  web.displayWidth = WEB_WIDTH * SCALE_FACTOR;
  web.displayHeight = webHeight * SCALE_FACTOR;
  web.setOrigin(0.5); // Center the sprite's origin
  webs.add(web);
  if (!web.body) {
    this.physics.world.enable(web);
  }
  // Fix: Use hardcoded size that matches original collision box
  web.body.setSize(800, 800);  // Slightly larger than WEB_SIZE (45) for better gameplay feel
  web.body.setAllowGravity(false);
  web.body.setImmovable(true);
  scheduleNextWebSpawn.call(this);
}

// --- Spider Spawning ---
function scheduleNextSpiderSpawn() {
  if (isGameOver) return;
  const delay = Phaser.Math.Between(
    SPIDER_SPAWN_DELAY_MIN,
    SPIDER_SPAWN_DELAY_MAX
  );
  if (spiderSpawnTimer) spiderSpawnTimer.remove();
  spiderSpawnTimer = this.time.delayedCall(delay, spawnSpider, [], this);
}
function spawnSpider() {
  if (isGameOver) return;
  const gameWidth = config.width;
  const spawnX = Phaser.Math.Between(gameWidth - 150, gameWidth - 30);
  const spawnY = Phaser.Math.Between(-80, -30);

  const spider = this.add.image(spawnX, spawnY, 'spider')
    .setOrigin(0.5, 0.5);
  spider.displayWidth = SPIDER_DISPLAY_SIZE;
  spider.displayHeight = SPIDER_DISPLAY_SIZE;
  spiders.add(spider);
  if (!spider.body) {
    this.physics.world.enable(spider);
  }
  if (spider.body) {
    // --- Hitbox: half as tall, shifted halfway right and halfway down ---
    const hitboxWidth = 600;
    const hitboxHeight = 300;
    spider.body.setSize(hitboxWidth, hitboxHeight);
    spider.body.setOffset(
      (spider.displayWidth - hitboxWidth) / 2 + hitboxWidth / 2,
      (spider.displayHeight - hitboxHeight) / 2 + hitboxHeight / 2
    );
    spider.body.setAllowGravity(false);
    spider.body.setVelocity(0, SPIDER_FALL_SPEED);
  } else {
    console.error("Failed to create physics body for spider!");
    spider.destroy();
    return;
  }

  spider.isOnGround = false;
  spider.isTracking = false;
  spider.trackingMobOffsetX = Phaser.Math.Between(
    -SPIDER_TRACKING_X_RANDOM_RANGE,
    SPIDER_TRACKING_X_RANDOM_RANGE
  );
  spider.trackingMobOffsetY = Phaser.Math.Between(
    -SPIDER_TRACKING_Y_RANDOM_RANGE,
    SPIDER_TRACKING_Y_RANDOM_RANGE
  );
  spider.webLine = this.add
    .line(0, 0, spider.x, 0, spider.x, spider.y, SPIDER_WEB_LINE_COLOR)
    .setOrigin(0, 0)
    .setLineWidth(SPIDER_WEB_LINE_WIDTH)
    .setDepth(-1);

  scheduleNextSpiderSpawn.call(this);
}

// --- Invincibility Power-up Spawning ---
function spawnInvincibilityPowerUp() {
  if (isGameOver) return;
  const gameWidth = config.width;
  const spawnX = gameWidth + 50;
  const spawnY = GROUND_LEVEL - INVINCIBILITY_POWERUP_SIZE * 1.5;

  // Check for nearby webs
  let tooCloseToWeb = false;
  webs.children.iterate((web) => {
    if (web && web.active) {
      const distance = Math.abs(web.x - spawnX);
      if (distance < POWERUP_WEB_SAFE_DISTANCE) {
        tooCloseToWeb = true;
        return false;
      }
    }
  });

  if (tooCloseToWeb) {
    // Try again next frame by not resetting the distance counter
    return;
  }

  // --- Use power.png icon for power-up ---
  const powerUp = this.add.image(
    spawnX,
    spawnY,
    'power'
  );
  powerUp.displayWidth = INVINCIBILITY_POWERUP_SIZE;
  powerUp.displayHeight = INVINCIBILITY_POWERUP_SIZE;
  invincibilityPowerUps.add(powerUp);
  if (!powerUp.body) {
    this.physics.world.enable(powerUp);
  }
  powerUp.body.setSize(INVINCIBILITY_POWERUP_SIZE, INVINCIBILITY_POWERUP_SIZE);
  powerUp.body.setAllowGravity(false);

  // Reset distance counter and pick a new threshold
  invincibilityDistanceSinceLast = 0;
  invincibilityDistanceThreshold = Phaser.Math.Between(INVINCIBILITY_DISTANCE_MIN, INVINCIBILITY_DISTANCE_MAX);
}

// --- Collision Handlers ---
function hitWeb(player, web) {
  if (isInvincible) {
    web.destroy(); // Destroy webs when invincible
    return;
  }
  if (webSlowState === "none") {
    webSlowState = "entering";
    webSlowTimer = 0;
    webSlowAmount = 0;
  }
  if (
    player &&
    player.body &&
    !player.body.blocked.down &&
    webStuckY === null
  ) {
    webStuckY = player.y;
    player.body.setVelocityY(0);
    player.body.setAllowGravity(false);
  }
  if (player && player.body && player.body.velocity.y < 0) {
    player.body.setVelocityY(0);
  }
}
function hitSpider(player, spider) {
  if (isInvincible) {
    if (spider.webLine) spider.webLine.destroy();
    spider.destroy(); // Destroy spiders when invincible
    return;
  }
  if (!isGameOver) {
    gameOver.call(this);
  }
}

function collectInvincibilityPowerUp(player, powerUp) {
  if (
    isGameOver ||
    hasInvincibilityPowerUp ||
    isInvincible
  ) {
    powerUp.destroy();
    return;
  }
  hasInvincibilityPowerUp = true;
  powerUp.destroy();
}

// --- Invincibility Activation/Deactivation ---
function startInvincibility() {
  if (
    isGameOver ||
    !hasInvincibilityPowerUp ||
    isInvincible ||
    !player ||
    !player.body
  ) {
    return;
  }

  console.log("Invincibility Activated!");
  hasInvincibilityPowerUp = false; // Consume the power-up
  isInvincible = true;

  // Visual feedback: flash player yellow/white
  if (player.setFillStyle) {
    this.tweens.add({
      targets: player,
      fillColor: { from: 0xffff00, to: 0xffffff },
      duration: 200,
      yoyo: true,
      repeat: Math.floor(INVINCIBILITY_DURATION / 400),
      onComplete: () => {
        if (player && player.active && player.setFillStyle) {
          player.setFillStyle(PLAYER_COLOR);
        }
      }
    });
  }

  player.body.setVelocityX(INVINCIBILITY_FORWARD_VELOCITY);

  if (invincibilityDurationTimer) invincibilityDurationTimer.remove();
  invincibilityDurationTimer = this.time.delayedCall(
    INVINCIBILITY_DURATION,
    endInvincibility,
    [],
    this
  );
}

function endInvincibility() {
  if (!isInvincible || !player || !player.body) {
    return;
  }

  console.log("Invincibility Ended.");
  isInvincible = false;

  if (player.body.velocity.x > 0) {
    player.body.setVelocityX(0);
  }

  if (player.setFillStyle) player.setFillStyle(PLAYER_COLOR);

  invincibilityDurationTimer = null;
}

// --- Game Over ---
function gameOver() {
  if (isGameOver) {
    return;
  }
  isGameOver = true;
  console.log("Game Over sequence started.");

  if (isInvincible) {
    endInvincibility.call(this);
  }
  if (invincibilityDurationTimer) {
    invincibilityDurationTimer.remove(false);
    invincibilityDurationTimer = null;
  }

  hasInvincibilityPowerUp = false;
  isInvincible = false;

  if (player && player.body) {
    player.body.stop();
    player.body.setVelocity(0, 0);
    console.log("Player physics stopped.");
  } else {
    console.warn("Player or player body not found during game over.");
  }
  player.anims?.stop();

  if (webSpawnTimer) webSpawnTimer.remove(false);
  if (spiderSpawnTimer) spiderSpawnTimer.remove(false);
  webSpawnTimer = spiderSpawnTimer = null;

  if (duckTween) duckTween.stop();
  this.tweens.killTweensOf(player);

  webs.children.iterate((obj) => obj?.body?.stop());
  spiders.children.iterate((obj) => {
    obj?.body?.stop();
    if (obj?.webLine) obj.webLine.destroy();
    obj.webLine = null;
  });
  invincibilityPowerUps.children.iterate((obj) => obj?.body?.stop());
  console.log("Obstacles and Powerups stopped.");

  this.physics.pause();
  console.log("Physics paused.");

  gameOverText.setVisible(true);
  console.log("Game Over text visible.");

  // Update high score display only (saving is handled in update)
  if (score > highScore) {
    highScore = Math.floor(score);
    highScoreText.setText("HIGH: " + highScore);
  }
}

// --- Update Loop ---
function update(time, delta) {
  // --- NEW: Pause update logic until game started ---
  if (!isGameStarted) {
    return;
  }

  if (isGameOver) {
    jumpInputFlag = false;
    isDuckButtonPressed = false;
    // Ensure buttons are hidden on game over screen if they were visible
    if (sprintButton.visible) sprintButton.setVisible(false);
    return;
  }

  const deltaFactor = delta / 16.666;
  const baseScrollDelta = scrollSpeed * deltaFactor;

  // --- Check for Web Overlap --- (Keep as is)
  if (player && player.active && webs) {
    this.physics.overlap(player, webs, hitWeb, null, this);
  }

  // --- Web Slowdown State Machine --- (Keep as is)
  let playerStillInWeb = false;
  if (
    (webSlowState === "entering" || webSlowState === "stuck") &&
    player &&
    player.active &&
    webs
  ) {
    playerStillInWeb = this.physics.overlap(player, webs);
  }
  if (
    (webSlowState === "entering" || webSlowState === "stuck") &&
    !playerStillInWeb
  ) {
    webSlowState = "recovering";
    webSlowTimer = 0;
  }
  if (webSlowState === "entering") {
    webSlowTimer += delta;
    let t = Math.min(webSlowTimer / WEB_SLOW_ENTER_DURATION, 1);
    webSlowAmount = t * t;
    if (webSlowTimer >= WEB_SLOW_ENTER_DURATION) {
      webSlowState = "stuck";
      webSlowTimer = 0;
      webSlowAmount = 1;
    }
    isSlowed = true;
  } else if (webSlowState === "stuck") {
    webSlowTimer += delta;
    webSlowAmount = 1;
    if (webSlowTimer >= WEB_SLOW_STUCK_DURATION) {
      webSlowState = "recovering";
      webSlowTimer = 0;
    }
    isSlowed = true;
  } else if (webSlowState === "recovering") {
    webSlowTimer += delta;
    webSlowAmount = 1 - Math.min(webSlowTimer / WEB_SLOW_RECOVER_DURATION, 1);
    if (webSlowTimer >= WEB_SLOW_RECOVER_DURATION) {
      webSlowState = "none";
      webSlowTimer = 0;
      webSlowAmount = 0;
    }
    isSlowed = webSlowAmount > 0.01;
  } else {
    webSlowAmount = 0;
    isSlowed = false;
  }

  // --- Web Stuck In Air / Gravity Management --- (Keep as is)
  if (player && player.body) {
    if (webSlowState === "entering" || webSlowState === "stuck") {
      if (webStuckY !== null) {
        player.y = webStuckY;
        player.body.setVelocityY(0);
        player.body.setAllowGravity(false);
      } else {
        player.body.setAllowGravity(true);
        player.body.gravity.y = config.physics.arcade.gravity.y;
      }
    } else {
      player.body.setAllowGravity(true);
      player.body.gravity.y = config.physics.arcade.gravity.y;
      if (webStuckY !== null) {
        webStuckY = null;
      }
    }
    if (player.body.blocked.down && webStuckY !== null) {
      player.body.setAllowGravity(true);
      player.body.gravity.y = config.physics.arcade.gravity.y;
      webStuckY = null;
      if (webSlowState === "entering" || webSlowState === "stuck") {
        webSlowState = "recovering";
        webSlowTimer = 0;
      }
    }
  }

  // --- Player Pushback (Wading Effect) --- (Keep as is)
  if (
    isSlowed &&
    player &&
    player.body &&
    (!isInvincible || player.body.velocity.x <= 0)
  ) {
    const pushbackAmount =
      scrollSpeed * WADING_PUSHBACK_FACTOR * webSlowAmount * deltaFactor;
    player.x -= pushbackAmount;
    if (player.x < PLAYER_PHYSICS_NORMAL_WIDTH / 2) {
      player.x = PLAYER_PHYSICS_NORMAL_WIDTH / 2;
    }
  }

  // --- Ground Scrolling --- (Keep as is)
  ground.children.iterate((tile) => {
    tile.x -= baseScrollDelta;
    if (tile.x <= -totalGroundWidth / numTiles) {
      tile.x += totalGroundWidth;
    }
  });

  // --- Obstacle/Powerup Movement & Cleanup --- (Keep as is)
  const objectVelocityX = -scrollSpeed * 60;
  webs.children.iterate((web) => {
    if (web && web.body) {
      web.body.setVelocityX(objectVelocityX);
      if (web.x + web.width < -50) {
        webs.remove(web, true, true);
      }
    } else if (web) {
      web.x -= baseScrollDelta;
      if (web.x + web.width < -50) webs.remove(web, true, true);
    }
  });
  spiders.children.iterate((spider) => {
    if (!spider || !spider.body || !spider.active) return;
    
    // Update web line if present
    if (spider.webLine?.active) {
        spider.webLine.setTo(spider.x, 0, spider.x, spider.y);
    }
    
    // Initialize spider properties if not set
    if (!spider.hasOwnProperty('jumpCooldown')) {
        spider.jumpCooldown = 0;
        spider.targetX = spider.x;
        spider.targetY = spider.y;
        spider.individualOffset = Math.random() * Math.PI * 2; // Random starting phase
        spider.movementSpeed = 0.001 + Math.random() * 0.001; // Random speed
        spider.preferredX = SPIDER_TRACKING_X_THRESHOLD + 
            (Math.random() - 0.5) * SPIDER_TRACKING_X_RANDOM_RANGE;
        // --- Add scuttle phase for rocking ---
        spider.scuttlePhase = Math.random() * Math.PI * 2;
    }

    // --- SCUTTLE EFFECT: Rocking motion ---
    // Parameters for scuttle
    const SCUTTLE_AMPLITUDE = 4; // pixels
    const SCUTTLE_FREQUENCY = 0.05; // radians/ms (about 1.5Hz)
    const SCUTTLE_ROTATE_AMPLITUDE = 0.13; // radians (~7.5deg)

    // Calculate scuttle offset and rotation
    const scuttleOsc = Math.sin(time * SCUTTLE_FREQUENCY + spider.scuttlePhase);
    const scuttleX = scuttleOsc * SCUTTLE_AMPLITUDE;
    const scuttleRot = scuttleOsc * SCUTTLE_ROTATE_AMPLITUDE;

    if (spider._baseX === undefined) spider._baseX = spider.x;
    if (spider.x > -SPIDER_SIZE * 2) {
        spider._baseX = spider.x - (spider.isOnGround ? scuttleX : 0);
    }

    if (!spider.isOnGround) {
        // Apply gravity when falling
        spider.body.velocity.y += 15;
        if (spider.body.velocity.y > SPIDER_FALL_SPEED) {
            spider.body.velocity.y = SPIDER_FALL_SPEED;
        }

        if (spider.y >= GROUND_LEVEL - SPIDER_DISPLAY_SIZE / 2 + SPIDER_GROUND_OFFSET) {
            spider.isOnGround = true;
            spider.y = GROUND_LEVEL - SPIDER_DISPLAY_SIZE / 2 + SPIDER_GROUND_OFFSET;
            spider.body.velocity.y = 0;
            if (spider.webLine?.active) spider.webLine.destroy();
            spider.webLine = null;
        }

        // --- No scuttle effect while falling ---
        spider.x = spider._baseX;
        spider.rotation = 0;
    } else {
        if (spider.y !== GROUND_LEVEL - SPIDER_DISPLAY_SIZE / 2 + SPIDER_GROUND_OFFSET) {
            spider.y = GROUND_LEVEL - SPIDER_DISPLAY_SIZE / 2 + SPIDER_GROUND_OFFSET;
        }
        if (spider.body.velocity.y !== 0) {
            spider.body.velocity.y = 0;
        }

        if (!spider.isTracking && spider.x <= SPIDER_TRACKING_X_THRESHOLD * 1.5) {
            spider.isTracking = true;
        }

        if (spider.isTracking && player) {
            // Flip spider based on player position (INVERTED)
            spider.setFlipX(spider.x < player.x);

            spider.targetX = spider.preferredX +
                Math.sin(time * spider.movementSpeed + spider.individualOffset) *
                (SPIDER_TRACKING_X_RANDOM_RANGE * 0.5);

            const distanceToTarget = spider.targetX - spider.x;
            const desiredVelocityX = distanceToTarget * 5;
            const maxTrackingSpeed = 120;
            const clampedDesiredVelocityX = Phaser.Math.Clamp(desiredVelocityX, -maxTrackingSpeed, maxTrackingSpeed);

            // Apply smoothing to horizontal movement
            spider.body.velocity.x = Phaser.Math.Linear(
                spider.body.velocity.x,
                clampedDesiredVelocityX,
                SPIDER_MOVEMENT_SMOOTHING
            );
        } else {
            spider.body.velocity.x = objectVelocityX * SPIDER_HORIZONTAL_SPEED_FACTOR;
        }

        // --- Apply scuttle effect visually only when on ground ---
        spider.x = spider._baseX + scuttleX;
        spider.rotation = scuttleRot;
    }

    if (spider.x < -SPIDER_SIZE * 2) {
        if (spider.webLine?.active) spider.webLine.destroy();
        spider.webLine = null;
        spiders.remove(spider, true, true);
    }
  });
  invincibilityPowerUps.children.iterate((powerUp) => {
    if (powerUp && powerUp.body) {
      powerUp.body.setVelocityX(objectVelocityX);
      if (powerUp.x + powerUp.width < -50) {
        invincibilityPowerUps.remove(powerUp, true, true);
      }
    } else if (powerUp) {
      powerUp.x -= baseScrollDelta;
      if (powerUp.x + powerUp.width < -50)
        invincibilityPowerUps.remove(powerUp, true, true);
    }
  });

  // --- Power-up Distance-based Spawning ---
  if (!isGameOver && isGameStarted) {
    invincibilityDistanceSinceLast += baseScrollDelta;
    if (invincibilityDistanceSinceLast >= invincibilityDistanceThreshold) {
      spawnInvincibilityPowerUp.call(this);
      // If spawn was blocked by a web, don't reset the distance counter, so it will try again next frame
      // (handled in spawnInvincibilityPowerUp)
    }
  }

  // --- Score Update ---
  score += ((isSlowed ? 0.7 : 1) * (1 - 0.5 * webSlowAmount)) * delta * 0.01;
  const currentScore = Math.floor(score);
  scoreText.setText("SCORE: " + currentScore);

  // Update and save high score in real-time if exceeded
  if (currentScore > highScore) {
    highScore = currentScore;
    highScoreText.setText("HIGH: " + highScore);
    // Save immediately when we have a new high score
    try {
      localStorage.setItem('HighScore', highScore.toString());
    } catch (e) {
      console.error('Failed to save high score:', e);
    }
  }

  // --- Invincibility Button Visibility ---
  const showInvincibilityButton = hasInvincibilityPowerUp && !isInvincible;
  if (sprintButton.visible !== showInvincibilityButton) {
      sprintButton.setVisible(showInvincibilityButton);
  }

  // --- Double Jump Cooldown Bar Visual ---
  if (doubleJumpCooldownActive) {
    doubleJumpCooldownBar.setFillStyle(COOLDOWN_BAR_COOLDOWN_COLOR);
    doubleJumpCooldownBarTimer += delta;
    const progress = Math.min(doubleJumpCooldownBarTimer / DOUBLE_JUMP_COOLDOWN_DURATION, 1);
    const barWidth = 60 * (1 - progress); // Calculate remaining width
    
    // Center the bar as it shrinks
    doubleJumpCooldownBar.setSize(barWidth, 8);
    doubleJumpCooldownBar.x = doubleJumpCooldownBarBg.x - (60 - barWidth) / 2;
  } else {
    doubleJumpCooldownBar.setFillStyle(COOLDOWN_BAR_READY_COLOR);
    doubleJumpCooldownBar.setSize(60, 8);
    doubleJumpCooldownBar.x = doubleJumpCooldownBarBg.x;
  }

  // --- Player Controls ---
  if (player && player.body && player.active) {
    const isTouchingGround = player.body.blocked.down;

    // --- Input States with JustDown ---
    const upArrowPressed = Phaser.Input.Keyboard.JustDown(cursors.up);
    const spacePressed = Phaser.Input.Keyboard.JustDown(spaceKey);
    const canJump = !isDucking && webSlowState !== "entering" && webSlowState !== "stuck";

    // --- Jumping Logic ---
    if (canJump) {
      // Handle all jump inputs together
      if ((spacePressed || upArrowPressed || jumpInputFlag) && (isTouchingGround || (jumpsAvailable > 0 && !doubleJumpCooldownActive && canDoubleJump))) {
        if (isTouchingGround) {
          // Normal jump from ground
          player.body.setVelocityY(JUMP_VELOCITY);
          jumpsAvailable = 1;
          canDoubleJump = true;
        } else {
          // Double jump in air
          player.body.setVelocityY(DOUBLE_JUMP_VELOCITY);
          jumpsAvailable = 0;
          canDoubleJump = false;
          doubleJumpCooldownActive = true;
          doubleJumpCooldownBarTimer = 0;
          
          if (doubleJumpCooldownTimer) doubleJumpCooldownTimer.remove();
          doubleJumpCooldownTimer = this.time.delayedCall(
            DOUBLE_JUMP_COOLDOWN_DURATION,
            () => {
              doubleJumpCooldownActive = false;
              doubleJumpCooldownTimer = null;
              if (player.body.blocked.down) {
                jumpsAvailable = 2;
                canDoubleJump = true;
              }
            },
            [],
            this
          );
        }
      }
    }
    jumpInputFlag = false;

    // Reset jumps when landing (if cooldown is over)
    if (isTouchingGround && !wasTouchingGround && !doubleJumpCooldownActive) {
      jumpsAvailable = 2;
      canDoubleJump = true;
    }

    // --- Stop Invincibility if Moving Backwards ---
    if (isInvincible && player.body.velocity.x < 0) {
      endInvincibility.call(this);
    }

    // --- Player Position Clamping --- (Keep as is)
    if (player.x < PLAYER_PHYSICS_NORMAL_WIDTH / 2) {
      player.x = PLAYER_PHYSICS_NORMAL_WIDTH / 2;
      if (player.body.velocity.x < 0) player.body.setVelocityX(0);
    }
    if (player.x > PLAYER_MAX_X) {
      player.x = PLAYER_MAX_X;
      if (isInvincible && player.body.velocity.x > 0) {
        player.body.setVelocityX(0);
      }
    }

    // --- Gravity Management --- MODIFIED
    if (player.body.allowGravity) {
      player.body.gravity.y = config.physics.arcade.gravity.y;
    }

    // --- Ducking (Keyboard + Touch Button) --- MODIFIED
    const shouldDuck = cursors.down.isDown || isDuckButtonPressed;
    const canDuck = isTouchingGround && !isInvincible; // Can only duck on ground and not invincible

    if (shouldDuck && canDuck && !isDucking) {
        isDucking = true;
        // --- Use smaller duck hitbox ---
        player.body.setSize(PLAYER_PHYSICS_NORMAL_WIDTH, PLAYER_PHYSICS_DUCK_HEIGHT);
        player.body.setOffset(
          (player.width - PLAYER_PHYSICS_NORMAL_WIDTH) / 2,
          player.height - PLAYER_PHYSICS_DUCK_HEIGHT - 6
        );
        if (duckTween) duckTween.stop();
        this.tweens.killTweensOf(player);
        duckTween = this.tweens.add({
          targets: player,
          displayHeight: PLAYER_SCALED_DUCK_HEIGHT,
          y: GROUND_LEVEL + 6,
          duration: 100,
          ease: "Power1",
          onComplete: () => {
            duckTween = null;
            player.displayHeight = PLAYER_SCALED_DUCK_HEIGHT;
            player.y = GROUND_LEVEL + 6;
          },
        });

    } else if (isDucking && (!shouldDuck || !isTouchingGround)) {
        isDucking = false;
        // --- Restore normal hitbox ---
        player.body.setSize(PLAYER_PHYSICS_NORMAL_WIDTH, PLAYER_PHYSICS_NORMAL_HEIGHT);
        player.body.setOffset(
          (player.width - PLAYER_PHYSICS_NORMAL_WIDTH) / 2,
          player.height - PLAYER_PHYSICS_NORMAL_HEIGHT - 6
        );
        if (duckTween) duckTween.stop();
        this.tweens.killTweensOf(player);
        duckTween = this.tweens.add({
          targets: player,
          displayHeight: PLAYER_SCALED_NORMAL_HEIGHT,
          y: GROUND_LEVEL + 6,
          duration: 100,
          ease: "Power1",
          onComplete: () => {
            duckTween = null;
            player.displayHeight = PLAYER_SCALED_NORMAL_HEIGHT;
            player.y = GROUND_LEVEL + 6;
          },
        });
    }

    // --- Invincibility Activation (Keyboard) ---
    // Touch activation is handled by the button listener directly
    if (cursors.right.isDown) {
        // Attempt to activate invincibility if key is pressed (conditions checked in startInvincibility)
        startInvincibility.call(this);
    }

    // --- Animation Control ---
    if (player.body.blocked.down && !isDucking) {
      if (player.anims.currentAnim?.key !== 'player_run' || !player.anims.isPlaying) {
        player.anims.play('player_run', true);
      }
    } else if (!isDucking) {
      // In air, keep running animation playing
      if (player.anims.currentAnim?.key !== 'player_run' || !player.anims.isPlaying) {
        player.anims.play('player_run', true);
      }
    } else {
      // Ducking: show standing frame
      player.anims.stop();
      player.setFrame(4);
    }

    // --- Update Ground Status for Next Frame ---
    wasTouchingGround = isTouchingGround; // IMPORTANT: Keep this at the end
  } // End player control check

  // --- Difficulty Increase --- (Keep as is)
  scrollSpeed += 0.0022 * deltaFactor;

  // --- Game Over Check (Player pushed off screen left) --- (Keep as is)
  if (player && player.active && player.getBounds().right < 0 && !isGameOver) {
    gameOver.call(this);
  }
} // End update

