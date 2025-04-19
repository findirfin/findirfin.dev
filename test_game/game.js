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
let sprintButtonText; // NEW: Need separate reference for text visibility
let jumpButton; // NEW: On-screen jump button
let isDuckButtonPressed = false;
let jumpInputFlag = false; // Still used for touch jump button
let doubleJumpCooldownBarBg = null; // NEW: Cooldown bar background
let doubleJumpCooldownBar = null;   // NEW: Cooldown bar fill
let doubleJumpCooldownBarTimer = 0; // NEW: For animation

// --- Player Constants & State ---
const PLAYER_START_Y = config.height * 0.85;
const PLAYER_NORMAL_HEIGHT = 50;
const PLAYER_DUCK_HEIGHT = 25;
const PLAYER_NORMAL_WIDTH = 30;
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

// --- Spider Constants ---
const SPIDER_COLOR = 0xff0000;
const SPIDER_SIZE = 20;
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
let invincibilitySpawnTimer;
let hasInvincibilityPowerUp = false;
let isInvincible = false;
let invincibilityDurationTimer = null;

const INVINCIBILITY_POWERUP_COLOR = 0xffff00;
const INVINCIBILITY_POWERUP_SIZE = 25;
const INVINCIBILITY_SPAWN_DELAY_MIN = 10000;
const INVINCIBILITY_SPAWN_DELAY_MAX = 20000;
const INVINCIBILITY_DURATION = 750;
const INVINCIBILITY_FORWARD_VELOCITY = 300;
const POWERUP_RETRY_DELAY = 1000; // NEW: Shorter delay for retry when blocked by webs
// --- Invincibility Power-up Variables & Constants --- END ---

// --- UI Constants ---
const BUTTON_SIZE = 60;
const BUTTON_MARGIN = 20;
const BUTTON_COLOR = 0xaaaaaa;
const BUTTON_ALPHA = 0.7;
const BUTTON_ACTIVE_ALPHA = 0.9;

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
  console.log("Preloading assets...");
}

function create() {
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
  player = this.add.rectangle(
    gameWidth * 0.45,
    PLAYER_START_Y,
    PLAYER_NORMAL_WIDTH,
    PLAYER_NORMAL_HEIGHT,
    PLAYER_COLOR
  );
  this.physics.add.existing(player);
  if (player.body) {
    player.body.setGravityY(config.physics.arcade.gravity.y);
    player.body.setCollideWorldBounds(false);
    player.body.setOffset(0, 0);
    player.body.setMaxVelocityX(INVINCIBILITY_FORWARD_VELOCITY * 1.5);
  } else {
    console.error("Player physics body not created!");
  }
  player.setOrigin(0.5, 1);
  player.y = GROUND_LEVEL;

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
    fontSize: "18px",
    fill: "#f7f7f7",
    fontFamily: '"Press Start 2P", monospace',
  });
  highScoreText.setOrigin(0, 0).setDepth(5).setScrollFactor(0);

  // Current score on the right
  scoreText = this.add.text(config.width - 150, 20, "SCORE: 0", {
    fontSize: "18px",
    fill: "#f7f7f7",
    fontFamily: '"Press Start 2P", monospace',
  });
  scoreText.setOrigin(0, 0).setDepth(5).setScrollFactor(0);

  // --- Sprint Indicator Icon --- REMOVED

  // --- Game Over Text ---
  gameOverText = this.add.text(
    gameWidth / 2,
    gameHeight / 2,
    "GAME OVER\nTap/Click to Restart", // Updated text
    {
      fontSize: "32px",
      fill: "#ff0000",
      fontFamily: '"Press Start 2P", monospace',
      align: "center",
    }
  );
  gameOverText.setOrigin(0.5);
  gameOverText.setVisible(false);
  gameOverText.setDepth(10);
  gameOverText.setScrollFactor(0);

  // --- Collisions ---
  this.physics.add.collider(player, ground);
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
  // Duck Button (Bottom Left)
  duckButton = this.add
    .rectangle(
      BUTTON_MARGIN + BUTTON_SIZE / 2,
      gameHeight - BUTTON_MARGIN - BUTTON_SIZE / 2,
      BUTTON_SIZE,
      BUTTON_SIZE,
      BUTTON_COLOR,
      BUTTON_ALPHA
    )
    .setInteractive()
    .setScrollFactor(0)
    .setDepth(10);
  this.add
    .text(duckButton.x, duckButton.y, "DUCK", {
      fontSize: "14px",
      fill: "#000000",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(11);

  // Jump Button (Bottom Right) - NEW
  jumpButton = this.add
    .rectangle(
      gameWidth - BUTTON_MARGIN - BUTTON_SIZE / 2, // Position where sprint was
      gameHeight - BUTTON_MARGIN - BUTTON_SIZE / 2,
      BUTTON_SIZE,
      BUTTON_SIZE,
      BUTTON_COLOR,
      BUTTON_ALPHA
    )
    .setInteractive()
    .setScrollFactor(0)
    .setDepth(10);
  this.add
    .text(jumpButton.x, jumpButton.y, "JUMP", {
      fontSize: "14px",
      fill: "#000000",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(11);

  // Sprint Button (Next to Jump Button, initially hidden) - MODIFIED
  const sprintButtonX =
    jumpButton.x - BUTTON_SIZE - BUTTON_MARGIN / 2; // Position left of Jump
  sprintButton = this.add
    .rectangle(
      sprintButtonX,
      gameHeight - BUTTON_MARGIN - BUTTON_SIZE / 2,
      BUTTON_SIZE,
      BUTTON_SIZE,
      BUTTON_COLOR,
      BUTTON_ALPHA
    )
    .setInteractive()
    .setScrollFactor(0)
    .setDepth(10)
    .setVisible(false); // Initially hidden

  sprintButtonText = this.add
    .text(sprintButton.x, sprintButton.y, "POWER", {
      fontSize: "14px",
      fill: "#000000",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(11)
    .setVisible(false); // Initially hidden

  // Duck Button Listeners
  duckButton.on("pointerdown", () => {
    isDuckButtonPressed = true;
    duckButton.fillAlpha = BUTTON_ACTIVE_ALPHA;
  });
  duckButton.on("pointerout", () => {
    isDuckButtonPressed = false;
    duckButton.fillAlpha = BUTTON_ALPHA;
  });
  // Global pointer up handles duck release as well
  this.input.on("pointerup", (pointer) => {
    // Check if the pointer that went up was the one pressing the duck button
    if (
      pointer.downX >= duckButton.getBounds().x &&
      pointer.downX <= duckButton.getBounds().right &&
      pointer.downY >= duckButton.getBounds().y &&
      pointer.downY <= duckButton.getBounds().bottom
    ) {
      isDuckButtonPressed = false;
      duckButton.fillAlpha = BUTTON_ALPHA;
    }
    // Reset jump button visual if pointer up happens anywhere
    if (jumpButton.fillAlpha === BUTTON_ACTIVE_ALPHA) {
        jumpButton.fillAlpha = BUTTON_ALPHA;
    }
  });

  // Jump Button Listener (Tap to Jump) - NEW
  jumpButton.on("pointerdown", () => {
    jumpInputFlag = true; // Signal a jump attempt for the update loop
    // Visual feedback for tap
    jumpButton.fillAlpha = BUTTON_ACTIVE_ALPHA;
    // No need for delayedCall to reset alpha, pointerup handles it
  });
  // Make sure releasing *off* the button also resets alpha
  jumpButton.on("pointerout", () => {
      if (jumpButton.fillAlpha === BUTTON_ACTIVE_ALPHA) {
          jumpButton.fillAlpha = BUTTON_ALPHA;
      }
  });


  // Sprint Button Listener (Tap to Activate Invincibility) - MODIFIED
  sprintButton.on("pointerdown", () => {
    // Only try to activate if the button is actually visible and conditions met
    if (sprintButton.visible) {
      startInvincibility.call(this); // startInvincibility already checks conditions
      // Visual feedback handled within startInvincibility if successful
    }
  });

  // Global Tap/Click Listener (Restart Only) - MODIFIED
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
        player.displayHeight = PLAYER_NORMAL_HEIGHT;
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
  scheduleNextInvincibilityPowerUp.call(this);

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
      fontSize: "12px",
      fill: "#ffffff",
      fontStyle: "bold"
    }
  ).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(101);

  console.log("Game created!");
}

// --- Helper: Draw Sprint Icon --- REMOVED

// --- Web Spawning --- (Keep as is)
function scheduleNextWebSpawn() {
  if (isGameOver) return;
  const speedFactor = Math.max(scrollSpeed / 3.0, 1);
  const minDelay = WEB_SPAWN_DELAY_MIN / speedFactor;
  const maxDelay = WEB_SPAWN_DELAY_MAX / speedFactor;
  const delay = Phaser.Math.Between(minDelay, maxDelay);
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
    webY = GROUND_LEVEL - PLAYER_DUCK_HEIGHT - webHeight / 2 - 15;
  }
  const web = this.add.rectangle(
    spawnX,
    webY,
    WEB_WIDTH,
    webHeight,
    WEB_COLOR
  );
  webs.add(web);
  if (!web.body) {
    this.physics.world.enable(web);
  }
  web.body.setSize(WEB_WIDTH, webHeight);
  web.body.setAllowGravity(false);
  web.body.setImmovable(true);
  scheduleNextWebSpawn.call(this);
}

// --- Spider Spawning --- (Keep as is)
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

  const spider = this.add.rectangle(
    spawnX,
    spawnY,
    SPIDER_SIZE,
    SPIDER_SIZE,
    SPIDER_COLOR
  );
  spiders.add(spider);
  if (!spider.body) {
    this.physics.world.enable(spider);
  }
  if (spider.body) {
    spider.body.setSize(SPIDER_SIZE, SPIDER_SIZE);
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
function scheduleNextInvincibilityPowerUp() {
  if (isGameOver) return;
  const delay = Phaser.Math.Between(
    INVINCIBILITY_SPAWN_DELAY_MIN,
    INVINCIBILITY_SPAWN_DELAY_MAX
  );
  if (invincibilitySpawnTimer) invincibilitySpawnTimer.remove();
  invincibilitySpawnTimer = this.time.delayedCall(
    delay,
    spawnInvincibilityPowerUp,
    [],
    this
  );
}
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
    // Retry sooner when blocked by webs
    if (invincibilitySpawnTimer) invincibilitySpawnTimer.remove();
    invincibilitySpawnTimer = this.time.delayedCall(POWERUP_RETRY_DELAY, spawnInvincibilityPowerUp, [], this);
    return;
  }

  const powerUp = this.add.rectangle(
    spawnX,
    spawnY,
    INVINCIBILITY_POWERUP_SIZE,
    INVINCIBILITY_POWERUP_SIZE,
    INVINCIBILITY_POWERUP_COLOR
  );
  invincibilityPowerUps.add(powerUp);
  if (!powerUp.body) {
    this.physics.world.enable(powerUp);
  }
  powerUp.body.setSize(INVINCIBILITY_POWERUP_SIZE, INVINCIBILITY_POWERUP_SIZE);
  powerUp.body.setAllowGravity(false);
  scheduleNextInvincibilityPowerUp.call(this);
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
  if (invincibilitySpawnTimer) invincibilitySpawnTimer.remove(false);
  webSpawnTimer = spiderSpawnTimer = invincibilitySpawnTimer = null;

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
  if (isGameOver) {
    jumpInputFlag = false;
    isDuckButtonPressed = false;
    // Ensure buttons are hidden on game over screen if they were visible
    if (sprintButton.visible) sprintButton.setVisible(false);
    if (sprintButtonText.visible) sprintButtonText.setVisible(false);
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
    if (player.x < PLAYER_NORMAL_WIDTH / 2) {
      player.x = PLAYER_NORMAL_WIDTH / 2;
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
    }

    if (!spider.isOnGround) {
        // Apply gravity when falling
        spider.body.velocity.y += 15;
        if (spider.body.velocity.y > SPIDER_FALL_SPEED) {
            spider.body.velocity.y = SPIDER_FALL_SPEED;
        }

        if (spider.y + SPIDER_SIZE / 2 >= GROUND_LEVEL) {
            spider.isOnGround = true;
            spider.y = GROUND_LEVEL - SPIDER_SIZE / 2;
            spider.body.velocity.y = 0;
            if (spider.webLine?.active) spider.webLine.destroy();
            spider.webLine = null;
        }
    } else {
        if (spider.y !== GROUND_LEVEL - SPIDER_SIZE / 2) {
            spider.y = GROUND_LEVEL - SPIDER_SIZE / 2;
        }
        if (spider.body.velocity.y !== 0) {
            spider.body.velocity.y = 0;
        }

        if (!spider.isTracking && spider.x <= SPIDER_TRACKING_X_THRESHOLD * 1.5) {
            spider.isTracking = true;
        }

        if (spider.isTracking) {
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
      sprintButtonText.setVisible(showInvincibilityButton);
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
    if (player.x < PLAYER_NORMAL_WIDTH / 2) {
      player.x = PLAYER_NORMAL_WIDTH / 2;
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
        // Start Ducking
        isDucking = true;
        player.body.setSize(PLAYER_NORMAL_WIDTH, PLAYER_DUCK_HEIGHT);
        player.body.setOffset(0, PLAYER_NORMAL_HEIGHT - PLAYER_DUCK_HEIGHT);
        if (duckTween) duckTween.stop();
        this.tweens.killTweensOf(player);
        duckTween = this.tweens.add({
          targets: player,
          displayHeight: PLAYER_DUCK_HEIGHT,
          duration: 100,
          ease: "Power1",
          onComplete: () => {
            duckTween = null;
          },
        });

    } else if (isDucking && (!shouldDuck || !isTouchingGround)) {
        // Stop Ducking (input released or left ground)
        isDucking = false;
        player.body.setSize(PLAYER_NORMAL_WIDTH, PLAYER_NORMAL_HEIGHT);
        player.body.setOffset(0, 0);
        if (duckTween) duckTween.stop();
        this.tweens.killTweensOf(player);
        duckTween = this.tweens.add({
          targets: player,
          displayHeight: PLAYER_NORMAL_HEIGHT,
          duration: 100,
          ease: "Power1",
          onComplete: () => {
            duckTween = null;
          },
        });
    }

    // --- Invincibility Activation (Keyboard) ---
    // Touch activation is handled by the button listener directly
    if (cursors.right.isDown) {
        // Attempt to activate invincibility if key is pressed (conditions checked in startInvincibility)
        startInvincibility.call(this);
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

