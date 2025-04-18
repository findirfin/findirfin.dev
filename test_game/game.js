// --- Configuration ---
const config = {
  type: Phaser.AUTO,
  // --- Design Resolution ---
  width: 800,
  height: 300,
  // --- Scaling Configuration --- ADDED
  scale: {
    mode: Phaser.Scale.FIT, // Fit the game within the container, maintaining aspect ratio
    parent: "phaser-game", // ID of the div to contain the canvas
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the canvas horizontally and vertically
    width: 800,
    height: 300,
  },
  // --- End Scaling Configuration ---
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
let score = 0;
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
const SPIDER_TRACKING_X_THRESHOLD = 30;
const SPIDER_WEB_LINE_COLOR = 0xffffff;
const SPIDER_WEB_LINE_WIDTH = 1;
const SPIDER_TRACKING_X_RANDOM_RANGE = SPIDER_TRACKING_X_THRESHOLD;
const SPIDER_TRACKING_Y_RANDOM_RANGE = 18;

// --- Sprint Power-up Variables & Constants --- START ---
let sprintPowerUps;
let sprintSpawnTimer;
let hasSprintPowerUp = false;
let isSprinting = false;
let sprintDurationTimer = null;

const SPRINT_POWERUP_COLOR = 0x00ccff;
const SPRINT_POWERUP_SIZE = 25;
const SPRINT_SPAWN_DELAY_MIN = 12000;
const SPRINT_SPAWN_DELAY_MAX = 20000;
const SPRINT_DURATION = 320;
const SPRINT_FORWARD_VELOCITY = 260;
// --- Sprint Power-up Variables & Constants --- END ---

// --- UI Constants ---
const BUTTON_SIZE = 60;
const BUTTON_MARGIN = 20;
const BUTTON_COLOR = 0xaaaaaa;
const BUTTON_ALPHA = 0.7;
const BUTTON_ACTIVE_ALPHA = 0.9;

// --- Game Instance ---
const game = new Phaser.Game(config);

// --- Scene Functions ---

function preload() {
  console.log("Preloading assets...");
}

function create() {
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
  hasSprintPowerUp = false;
  isSprinting = false;
  isDuckButtonPressed = false;
  jumpInputFlag = false;

  if (sprintDurationTimer) {
    sprintDurationTimer.remove();
    sprintDurationTimer = null;
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
    player.body.setMaxVelocityX(SPRINT_FORWARD_VELOCITY * 1.5);
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

  // --- Sprint Power-up Group ---
  sprintPowerUps = this.physics.add.group({
    allowGravity: false,
    immovable: false,
  });

  // --- Score ---
  scoreText = this.add.text(gameWidth - 150, 20, "SCORE: 0", {
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
    sprintPowerUps,
    collectSprintPowerUp,
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
    .text(sprintButton.x, sprintButton.y, "SPRINT", {
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


  // Sprint Button Listener (Tap to Sprint) - MODIFIED (visibility handled elsewhere)
  sprintButton.on("pointerdown", () => {
    // Only try to sprint if the button is actually visible and conditions met
    if (sprintButton.visible) {
      startSprint.call(this); // startSprint already checks conditions
      // Visual feedback handled within startSprint if successful
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
  scheduleNextSprintPowerUp.call(this);

  // --- Initialize Player State ---
  wasTouchingGround = false;

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

// --- Sprint Power-up Spawning --- (Keep as is)
function scheduleNextSprintPowerUp() {
  if (isGameOver) return;
  const delay = Phaser.Math.Between(
    SPRINT_SPAWN_DELAY_MIN,
    SPRINT_SPAWN_DELAY_MAX
  );
  if (sprintSpawnTimer) sprintSpawnTimer.remove();
  sprintSpawnTimer = this.time.delayedCall(
    delay,
    spawnSprintPowerUp,
    [],
    this
  );
}
function spawnSprintPowerUp() {
  if (isGameOver) return;
  const gameWidth = config.width;
  const spawnX = gameWidth + 50;
  const spawnY = GROUND_LEVEL - SPRINT_POWERUP_SIZE * 1.5;

  const powerUp = this.add.rectangle(
    spawnX,
    spawnY,
    SPRINT_POWERUP_SIZE,
    SPRINT_POWERUP_SIZE,
    SPRINT_POWERUP_COLOR
  );
  sprintPowerUps.add(powerUp);
  if (!powerUp.body) {
    this.physics.world.enable(powerUp);
  }
  powerUp.body.setSize(SPRINT_POWERUP_SIZE, SPRINT_POWERUP_SIZE);
  powerUp.body.setAllowGravity(false);
  scheduleNextSprintPowerUp.call(this);
}

// --- Collision Handlers ---
// (Keep hitWeb, hitSpider as they are)
function hitWeb(player, web) {
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
  if (isSprinting) {
    endSprint.call(this);
  }
}
function hitSpider(player, spider) {
  if (!isGameOver) {
    gameOver.call(this);
  }
}

// MODIFIED: Show sprint button on collect
function collectSprintPowerUp(player, powerUp) {
  if (
    isGameOver ||
    hasSprintPowerUp ||
    isSprinting
  ) {
    powerUp.destroy();
    return;
  }
  hasSprintPowerUp = true;
  // No indicator icon to show
  // Visibility handled in update loop now
  powerUp.destroy();
}

// --- Sprint Activation/Deactivation --- START ---
// MODIFIED: Add button visual feedback on start, hide button on start
function startSprint() {
  if (
    isGameOver ||
    !hasSprintPowerUp ||
    isSprinting ||
    !player ||
    !player.body
  ) {
    return;
  }
  if (player.x > PLAYER_MAX_X - 30) {
    return;
  }

  console.log("Sprint Activated!");
  hasSprintPowerUp = false; // Consume the power-up
  isSprinting = true;
  // Hide the button immediately when sprint starts
  // sprintButton.setVisible(false); // Visibility handled in update loop
  // sprintButtonText.setVisible(false);

  player.body.setVelocityX(SPRINT_FORWARD_VELOCITY);

  // Visual feedback: flash player
  if (player.setFillStyle) {
    player.setFillStyle(0xffffff); // White flash
    this.time.delayedCall(SPRINT_DURATION, () => {
        if (player && player.active && player.setFillStyle) {
            player.setFillStyle(PLAYER_COLOR); // Reset color after duration
        }
    });
  }
  // Visual feedback: flash sprint button briefly on activation
  if (sprintButton.visible) { // Check visible in case called by keyboard
      sprintButton.fillAlpha = BUTTON_ACTIVE_ALPHA;
      this.time.delayedCall(100, () => {
          // Alpha will be reset by visibility logic in update anyway
          sprintButton.fillAlpha = BUTTON_ALPHA;
      });
  }


  if (sprintDurationTimer) sprintDurationTimer.remove();
  sprintDurationTimer = this.time.delayedCall(
    SPRINT_DURATION,
    endSprint,
    [],
    this
  );
}

// MODIFIED: Ensure cooldown starts
function endSprint() {
  if (!isSprinting || !player || !player.body) {
    return;
  }

  console.log("Sprint Ended.");
  isSprinting = false;

  if (player.body.velocity.x > 0) {
    player.body.setVelocityX(0);
  }

  if (player.setFillStyle) player.setFillStyle(PLAYER_COLOR);

  sprintDurationTimer = null;
}
// --- Sprint Activation/Deactivation --- END ---

// --- Game Over ---
// MODIFIED: Remove sprint indicator logic
function gameOver() {
  if (isGameOver) {
    return;
  }
  isGameOver = true;
  console.log("Game Over sequence started.");

  if (isSprinting) {
    endSprint.call(this);
  }
  if (sprintDurationTimer) {
    sprintDurationTimer.remove(false);
    sprintDurationTimer = null;
  }
  hasSprintPowerUp = false;
  isSprinting = false;
  // No sprint indicator to hide

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
  if (sprintSpawnTimer) sprintSpawnTimer.remove(false);
  webSpawnTimer = spiderSpawnTimer = sprintSpawnTimer = null;

  if (duckTween) duckTween.stop();
  this.tweens.killTweensOf(player);

  webs.children.iterate((obj) => obj?.body?.stop());
  spiders.children.iterate((obj) => {
    obj?.body?.stop();
    if (obj?.webLine) obj.webLine.destroy();
    obj.webLine = null;
  });
  sprintPowerUps.children.iterate((obj) => obj?.body?.stop());
  console.log("Obstacles and Powerups stopped.");

  this.physics.pause();
  console.log("Physics paused.");

  gameOverText.setVisible(true);
  console.log("Game Over text visible.");
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
    (!isSprinting || player.body.velocity.x <= 0)
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
    if (spider.webLine?.active) {
      spider.webLine.setTo(spider.x, 0, spider.x, spider.y);
    } else if (spider.webLine) {
      spider.webLine = null;
    }
    if (!spider.isOnGround) {
      if (spider.y + SPIDER_SIZE / 2 >= GROUND_LEVEL) {
        spider.isOnGround = true;
        spider.y = GROUND_LEVEL - SPIDER_SIZE / 2;
        spider.body.velocity.y = 0;
        if (spider.webLine?.active) spider.webLine.destroy();
        spider.webLine = null;
        spider.body.velocity.x =
          objectVelocityX * SPIDER_HORIZONTAL_SPEED_FACTOR;
      } else {
        spider.body.velocity.x = 0;
        spider.body.velocity.y = SPIDER_FALL_SPEED;
      }
    } else {
      if (!spider.isTracking) {
        if (spider.x <= SPIDER_TRACKING_X_THRESHOLD) {
          spider.isTracking = true;
          spider.trackingTransition = true;
        } else {
          spider.y = GROUND_LEVEL - SPIDER_SIZE / 2;
          spider.body.velocity.y = 0;
          spider.body.velocity.x =
            objectVelocityX * SPIDER_HORIZONTAL_SPEED_FACTOR;
        }
      }
      if (spider.isTracking) {
        const targetX =
          SPIDER_TRACKING_X_THRESHOLD + (spider.trackingMobOffsetX || 0);
        const targetY =
          GROUND_LEVEL - SPIDER_SIZE / 2 + (spider.trackingMobOffsetY || 0);
        if (spider.trackingTransition) {
          const lerpFactor = 0.18;
          spider.x += (targetX - spider.x) * lerpFactor;
          spider.y += (targetY - spider.y) * lerpFactor;
          if (
            Math.abs(spider.x - targetX) < 1 &&
            Math.abs(spider.y - targetY) < 1
          ) {
            spider.x = targetX;
            spider.y = targetY;
            spider.trackingTransition = false;
          }
        } else {
          spider.x = targetX;
          spider.y = targetY;
        }
        spider.body.velocity.x = 0;
        spider.body.velocity.y = 0;
      }
    }
    if (
      spider.x < -SPIDER_SIZE * 2 ||
      spider.y > config.height + SPIDER_SIZE * 2 ||
      spider.y < -SPIDER_SIZE * 4
    ) {
      if (spider.webLine?.active) spider.webLine.destroy();
      spider.webLine = null;
      spiders.remove(spider, true, true);
    }
  });
  sprintPowerUps.children.iterate((powerUp) => {
    if (powerUp && powerUp.body) {
      powerUp.body.setVelocityX(objectVelocityX);
      if (powerUp.x + powerUp.width < -50) {
        sprintPowerUps.remove(powerUp, true, true);
      }
    } else if (powerUp) {
      powerUp.x -= baseScrollDelta;
      if (powerUp.x + powerUp.width < -50)
        sprintPowerUps.remove(powerUp, true, true);
    }
  });

  // --- Score Update --- (Keep as is)
  score += ((isSlowed ? 0.7 : 1) * (1 - 0.5 * webSlowAmount)) * delta * 0.01;
  scoreText.setText("SCORE: " + Math.floor(score));

  // --- Sprint Button Visibility --- NEW ---
  // Show the button if we have the powerup and are not currently sprinting
  const showSprintButton = hasSprintPowerUp && !isSprinting;
  if (sprintButton.visible !== showSprintButton) {
      sprintButton.setVisible(showSprintButton);
      sprintButtonText.setVisible(showSprintButton);
  }


  // --- Player Controls & State Update ---
  if (player && player.body && player.active) {
    const isTouchingGround = player.body.blocked.down;

    // --- Input States ---
    const jumpKeyPressed = cursors.up.isDown || spaceKey.isDown;
    const duckKeyPressed = cursors.down.isDown;
    const sprintKeyPressed = cursors.right.isDown;

    // --- Stop Sprint if Moving Backwards --- (Keep as is)
    if (isSprinting && player.body.velocity.x < 0) {
      endSprint.call(this);
    }

    // --- Player Position Clamping --- (Keep as is)
    if (player.x < PLAYER_NORMAL_WIDTH / 2) {
      player.x = PLAYER_NORMAL_WIDTH / 2;
      if (player.body.velocity.x < 0) player.body.setVelocityX(0);
    }
    if (player.x > PLAYER_MAX_X) {
      player.x = PLAYER_MAX_X;
      if (isSprinting && player.body.velocity.x > 0) {
        player.body.setVelocityX(0);
      }
    }

    // --- Jumping (Keyboard + Touch Button) --- MODIFIED
    if (
      (jumpKeyPressed || jumpInputFlag) && // Combine keyboard and touch flag
      isTouchingGround &&
      !isDucking &&
      webSlowState !== "entering" &&
      webSlowState !== "stuck"
    ) {
      player.body.setVelocityY(JUMP_VELOCITY);
      // Reset touch flag immediately after use
      // jumpInputFlag = false; // Moved reset below
    }
    // Reset jump flag at the end of the player control block for this frame
    jumpInputFlag = false;

    // --- Gravity Management --- MODIFIED
    if (player.body.allowGravity) {
      player.body.gravity.y = config.physics.arcade.gravity.y;
    }

    // --- Ducking (Keyboard + Touch Button) --- MODIFIED
    const shouldDuck = duckKeyPressed || isDuckButtonPressed;
    const canDuck = isTouchingGround && !isSprinting; // Can only duck on ground and not sprinting

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

    // --- Sprint Activation (Keyboard) --- MODIFIED
    // Touch activation is handled by the button listener directly
    if (sprintKeyPressed) {
        // Attempt to sprint if key is pressed (conditions checked in startSprint)
        startSprint.call(this);
    }

    // --- Update Ground Status for Next Frame ---
    wasTouchingGround = isTouchingGround;
  } // End player control check

  // --- Difficulty Increase --- (Keep as is)
  scrollSpeed += 0.0022 * deltaFactor;

  // --- Game Over Check (Player pushed off screen left) --- (Keep as is)
  if (player && player.active && player.getBounds().right < 0 && !isGameOver) {
    gameOver.call(this);
  }
} // End update
