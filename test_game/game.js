// --- Configuration ---
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 300,
  parent: "phaser-game",
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
};

// --- Global Variables ---
let player;
let cursors;
let ground;
let spaceKey;
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
let sprintIndicatorIcon; // NEW: graphics icon for sprint indicator

// --- Player Constants & State ---
const PLAYER_START_Y = config.height * 0.85;
const PLAYER_NORMAL_HEIGHT = 50;
const PLAYER_DUCK_HEIGHT = 25;
const PLAYER_NORMAL_WIDTH = 30;
const PLAYER_COLOR = 0xf7f7f7;
const GROUND_LEVEL = config.height * 0.9;
let scrollSpeed = 3.0; // Base scroll speed
let isSlowed = false;
// --- Web Slowdown State ---
let webSlowState = "none"; // "none", "entering", "stuck", "recovering"
let webSlowTimer = 0;
const WEB_SLOW_ENTER_DURATION = 80; // ms to reach max slow (was 350)
const WEB_SLOW_STUCK_DURATION = 400; // ms stuck at max slow
const WEB_SLOW_RECOVER_DURATION = 500; // ms to recover to normal
let webSlowAmount = 0; // 0 = normal, 1 = max slow
const WADING_PUSHBACK_FACTOR = 0.7; // was 0.4, increased for stronger slowdown
let totalGroundWidth;
let numTiles;
const PLAYER_MAX_X = config.width * 0.75; // Prevent player dashing too far right
let webStuckY = null; // NEW: Track Y position when stuck in web mid-air

// --- Player State Variables for Juice ---
let wasTouchingGround = false;
const JUMP_VELOCITY = -700;
const JUMP_VARIABLE_GRAVITY_MULTIPLIER = 3;

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
let sprintCooldownTimer = null; // NEW: cooldown after sprint

const SPRINT_POWERUP_COLOR = 0x00ccff;
const SPRINT_POWERUP_SIZE = 25;
// Make powerup spawn less frequently
const SPRINT_SPAWN_DELAY_MIN = 12000; // was 5000
const SPRINT_SPAWN_DELAY_MAX = 20000; // was 10000
// Make sprint less powerful
const SPRINT_DURATION = 320; // was 500 (ms)
const SPRINT_FORWARD_VELOCITY = 260; // was 450
const SPRINT_COOLDOWN = 3500; // ms after use before another can be collected
// --- Sprint Power-up Variables & Constants --- END ---

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
  scrollSpeed = 3.0; // Reset base speed
  score = 0;
  hasSprintPowerUp = false;
  isSprinting = false;
  if (sprintDurationTimer) {
    sprintDurationTimer.remove();
    sprintDurationTimer = null;
  }
  if (sprintCooldownTimer) {
    sprintCooldownTimer.remove();
    sprintCooldownTimer = null;
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
    gameWidth * 0.45, // Start position
    PLAYER_START_Y,
    PLAYER_NORMAL_WIDTH,
    PLAYER_NORMAL_HEIGHT,
    PLAYER_COLOR
  );
  this.physics.add.existing(player);
  if (player.body) {
    player.body.setGravityY(config.physics.arcade.gravity.y);
    player.body.setCollideWorldBounds(false); // Allow temporary move right
    player.body.setOffset(0, 0);
    player.body.setMaxVelocityX(SPRINT_FORWARD_VELOCITY * 1.5); // Allow high sprint velocity
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
  scoreText.setOrigin(0, 0).setDepth(5);

  // --- Sprint Indicator Icon (Lightning Bolt) ---
  sprintIndicatorIcon = this.add.graphics();
  drawSprintIcon(sprintIndicatorIcon, 40, 40, SPRINT_POWERUP_COLOR);
  sprintIndicatorIcon.setPosition(30, 30);
  sprintIndicatorIcon.setDepth(5);
  sprintIndicatorIcon.setVisible(false);

  // --- Game Over Text ---
  gameOverText = this.add.text(
    gameWidth / 2,
    gameHeight / 2,
    "GAME OVER\nClick to Restart",
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
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  this.input.on("pointerdown", () => {
    if (isGameOver) {
      console.log("Restarting game...");
      if (duckTween) duckTween.stop();
      player.displayHeight = PLAYER_NORMAL_HEIGHT;
      isDucking = false;
      duckTween = null;
      spiders.children.iterate((spider) => {
        if (spider && spider.webLine) {
          spider.webLine.destroy();
          spider.webLine = null;
        }
      });
      this.scene.restart();
    }
  });

  // --- Spawning Timers ---
  scheduleNextWebSpawn.call(this);
  scheduleNextSpiderSpawn.call(this);
  scheduleNextSprintPowerUp.call(this);

  // --- Initialize Player State ---
  wasTouchingGround = false;

  console.log("Game created!");
}

// --- Helper: Draw Sprint Icon (Lightning Bolt) ---
function drawSprintIcon(graphics, width, height, color) {
  graphics.clear();
  graphics.fillStyle(color, 1);
  // Draw a simple stylized lightning bolt
  graphics.beginPath();
  graphics.moveTo(width * 0.2, 0);
  graphics.lineTo(width * 0.6, height * 0.45);
  graphics.lineTo(width * 0.45, height * 0.45);
  graphics.lineTo(width * 0.8, height);
  graphics.lineTo(width * 0.4, height * 0.55);
  graphics.lineTo(width * 0.55, height * 0.55);
  graphics.closePath();
  graphics.fillPath();
}

// --- Web Spawning ---
function scheduleNextWebSpawn() {
  if (isGameOver) return;
  // Calculate a base delay that shrinks as scrollSpeed increases
  // The 3.0 is your starting scrollSpeed; adjust divisor for tuning
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
  // Velocity set in update
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

// --- Sprint Power-up Spawning ---
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
  // Velocity set in update
  scheduleNextSprintPowerUp.call(this);
}

// --- Collision Handlers ---
function hitWeb(player, web) {
  // Only START the slow sequence if not already slowed/stuck
  if (webSlowState === "none") {
    webSlowState = "entering";
    webSlowTimer = 0;
    webSlowAmount = 0;
  }

  // If player is airborne WHEN hitting the web, capture Y and disable gravity
  // Only capture ONCE per airborne web encounter
  if (
    player &&
    player.body &&
    !player.body.blocked.down &&
    webStuckY === null
  ) {
    webStuckY = player.y;
    player.body.setVelocityY(0); // Stop vertical motion immediately
    player.body.setAllowGravity(false); // Disable gravity
  }

  // --- Slow down jump if hit mid-air while moving up ---
  if (player && player.body && player.body.velocity.y < 0) {
    player.body.setVelocityY(0); // Hard stop
  }

  // If hit a web while sprinting, end the sprint immediately
  if (isSprinting) {
    endSprint.call(this);
  }
}

function hitSpider(player, spider) {
  if (!isGameOver) {
    gameOver.call(this);
  }
}

function collectSprintPowerUp(player, powerUp) {
  if (
    isGameOver ||
    hasSprintPowerUp ||
    isSprinting ||
    sprintCooldownTimer // NEW: can't collect during cooldown
  ) {
    powerUp.destroy();
    return;
  }
  hasSprintPowerUp = true;
  if (sprintIndicatorIcon) sprintIndicatorIcon.setVisible(true); // SHOW ICON
  powerUp.destroy();
}

// --- Sprint Activation/Deactivation --- START ---
function startSprint() {
  if (
    isGameOver ||
    !hasSprintPowerUp ||
    isSprinting ||
    !player ||
    !player.body ||
    sprintCooldownTimer // NEW: can't start during cooldown
  ) {
    return;
  }

  // Prevent sprint if player is already near the right edge
  if (player.x > PLAYER_MAX_X - 30) {
    return;
  }

  console.log("Sprint Activated!");
  hasSprintPowerUp = false;
  isSprinting = true;
  if (sprintIndicatorIcon) sprintIndicatorIcon.setVisible(false); // HIDE ICON

  // Apply forward velocity boost
  player.body.setVelocityX(SPRINT_FORWARD_VELOCITY);

  // Visual feedback: flash tint
  if (player.setFillStyle) {
    player.setFillStyle(0xffffff);
    setTimeout(() => {
      if (player && player.setFillStyle) player.setFillStyle(PLAYER_COLOR);
    }, SPRINT_DURATION);
  }

  // Set a timer to end the sprint
  if (sprintDurationTimer) sprintDurationTimer.remove();
  sprintDurationTimer = this.time.delayedCall(
    SPRINT_DURATION,
    endSprint,
    [],
    this
  );
}

function endSprint() {
  if (!isSprinting || !player || !player.body) {
    return;
  }

  console.log("Sprint Ended.");
  isSprinting = false;

  // Remove forward velocity boost
  if (player.body.velocity.x > 0) {
    player.body.setVelocityX(0);
  }

  // Visual feedback: ensure color reset
  if (player.setFillStyle) player.setFillStyle(PLAYER_COLOR);

  sprintDurationTimer = null;

  // Start cooldown before another sprint can be collected
  if (sprintCooldownTimer) sprintCooldownTimer.remove();
  sprintCooldownTimer = this.time.delayedCall(
    SPRINT_COOLDOWN,
    () => {
      sprintCooldownTimer = null;
    },
    [],
    this
  );

  if (sprintIndicatorIcon) sprintIndicatorIcon.setVisible(false); // HIDE ICON
}
// --- Sprint Activation/Deactivation --- END ---

// --- Game Over ---
function gameOver() {
  if (isGameOver) {
    return;
  }
  isGameOver = true;
  console.log("Game Over sequence started.");

  // --- Stop Sprinting ---
  if (isSprinting) {
    endSprint.call(this); // Properly end sprint effects
  }
  if (sprintDurationTimer) {
    sprintDurationTimer.remove(false);
    sprintDurationTimer = null;
  }
  if (sprintCooldownTimer) {
    sprintCooldownTimer.remove(false);
    sprintCooldownTimer = null;
  }
  hasSprintPowerUp = false;
  isSprinting = false;
  if (sprintIndicatorIcon) sprintIndicatorIcon.setVisible(false); // HIDE ICON

  if (player && player.body) {
    player.body.stop();
    player.body.setVelocity(0, 0); // Stop all movement
    console.log("Player physics stopped.");
  } else {
    console.warn("Player or player body not found during game over.");
  }
  player.anims?.stop();

  // Stop spawners
  if (webSpawnTimer) webSpawnTimer.remove(false);
  if (spiderSpawnTimer) spiderSpawnTimer.remove(false);
  if (sprintSpawnTimer) sprintSpawnTimer.remove(false);
  webSpawnTimer = spiderSpawnTimer = sprintSpawnTimer = null;

  if (duckTween) duckTween.stop();
  this.tweens.killTweensOf(player);

  // Stop obstacles and powerups
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
    return;
  }

  // Calculate scroll amount based on delta for smoother movement
  const deltaFactor = delta / 16.666; // Normalize delta time (assuming 60fps target)
  const baseScrollDelta = scrollSpeed * deltaFactor;

  // --- Check for Web Overlap (Runs Every Frame) ---
  if (player && player.active && webs) {
    this.physics.overlap(player, webs, hitWeb, null, this);
  }

  // --- Web Slowdown State Machine ---
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

  // --- Web Stuck In Air / Gravity Management ---
  if (player && player.body) {
    if (webSlowState === "entering" || webSlowState === "stuck") {
      if (webStuckY !== null) {
        // Player hit web mid-air, keep them stuck
        player.y = webStuckY;
        player.body.setVelocityY(0);
        player.body.setAllowGravity(false);
      } else {
        // Player hit web on ground, allow normal gravity
        player.body.setAllowGravity(true);
        player.body.gravity.y = config.physics.arcade.gravity.y;
      }
    } else {
      // Not entering or stuck in web ("recovering" or "none")
      player.body.setAllowGravity(true);
      player.body.gravity.y = config.physics.arcade.gravity.y;
      if (webStuckY !== null) {
        webStuckY = null;
      }
    }

    // If player lands on ground while stuck, clear stuck state immediately
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

  // --- Player Pushback (Wading Effect) ---
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

  // --- Ground Scrolling ---
  ground.children.iterate((tile) => {
    tile.x -= baseScrollDelta;
    if (tile.x <= -totalGroundWidth / numTiles) {
      tile.x += totalGroundWidth;
    }
  });

  // --- Obstacle/Powerup Movement & Cleanup ---
  // Use the base scrollSpeed for all environmental objects
  const objectVelocityX = -scrollSpeed * 60; // Velocity needs to be pixels/sec

  webs.children.iterate((web) => {
    if (web && web.body) {
      web.body.setVelocityX(objectVelocityX);
      if (web.x + web.width < -50) {
        webs.remove(web, true, true);
      }
    } else if (web) {
      web.x -= baseScrollDelta; // Fallback if body missing
      if (web.x + web.width < -50) webs.remove(web, true, true);
    }
  });

  spiders.children.iterate((spider) => {
    if (!spider || !spider.body || !spider.active) return;

    if (spider.webLine?.active) {
      spider.webLine.setTo(spider.x, 0, spider.x, spider.y);
    } else if (spider.webLine) {
      // Clean up destroyed line reference
      spider.webLine = null;
    }

    if (!spider.isOnGround) {
      if (spider.y + SPIDER_SIZE / 2 >= GROUND_LEVEL) {
        spider.isOnGround = true;
        spider.y = GROUND_LEVEL - SPIDER_SIZE / 2;
        spider.body.velocity.y = 0;
        if (spider.webLine?.active) spider.webLine.destroy();
        spider.webLine = null;
        // Ground speed depends on base scrollSpeed
        spider.body.velocity.x =
          objectVelocityX * SPIDER_HORIZONTAL_SPEED_FACTOR;
      } else {
        // Still falling
        spider.body.velocity.x = 0;
        spider.body.velocity.y = SPIDER_FALL_SPEED;
      }
    } else {
      // Spider is on the ground
      if (!spider.isTracking) {
        // Check if it should start tracking
        if (spider.x <= SPIDER_TRACKING_X_THRESHOLD) {
          spider.isTracking = true;
          spider.trackingTransition = true; // Start lerping to tracking position
        } else {
          // Continue moving left on the ground
          spider.y = GROUND_LEVEL - SPIDER_SIZE / 2; // Keep Y fixed
          spider.body.velocity.y = 0;
          spider.body.velocity.x =
            objectVelocityX * SPIDER_HORIZONTAL_SPEED_FACTOR;
        }
      }

      // Handle tracking behavior
      if (spider.isTracking) {
        const targetX =
          SPIDER_TRACKING_X_THRESHOLD + (spider.trackingMobOffsetX || 0);
        const targetY =
          GROUND_LEVEL - SPIDER_SIZE / 2 + (spider.trackingMobOffsetY || 0);

        // Smoothly move to the tracking position initially
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
            spider.trackingTransition = false; // Snapped to position
          }
        } else {
          // Stay fixed at the tracking position
          spider.x = targetX;
          spider.y = targetY;
        }
        spider.body.velocity.x = 0; // Stop horizontal movement when tracking
        spider.body.velocity.y = 0; // Always stop vertical movement when tracking
      }
    }

    // Cleanup spiders that go way off screen
    if (
      spider.x < -SPIDER_SIZE * 2 ||
      spider.y > config.height + SPIDER_SIZE * 2 ||
      spider.y < -SPIDER_SIZE * 4 // Check above screen too
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
      powerUp.x -= baseScrollDelta; // Fallback if body missing
      if (powerUp.x + powerUp.width < -50)
        sprintPowerUps.remove(powerUp, true, true);
    }
  });

  // --- Score Update ---
  // Score increases at a constant rate relative to base speed now
  score += ((isSlowed ? 0.7 : 1) * (1 - 0.5 * webSlowAmount)) * delta * 0.01;
  scoreText.setText("SCORE: " + Math.floor(score));

  // --- Player Controls & State Update ---
  if (player && player.body && player.active) {
    // Use blocked.down for a more reliable ground check against static bodies
    const isTouchingGround = player.body.blocked.down;
    const jumpKeyPressed = cursors.up.isDown || spaceKey.isDown;
    const jumpKeyReleased = cursors.up.isUp && spaceKey.isUp;
    const sprintKeyPressed = cursors.right.isDown;

    // --- Stop Sprint if Moving Backwards ---
    // If something external forces player velocity negative while sprinting, end sprint.
    if (isSprinting && player.body.velocity.x < 0) {
      endSprint.call(this);
    }

    // --- Player Position Clamping ---
    // Prevent player from being pushed too far left by webs (redundant check, also in pushback)
    if (player.x < PLAYER_NORMAL_WIDTH / 2) {
      player.x = PLAYER_NORMAL_WIDTH / 2;
      if (player.body.velocity.x < 0) player.body.setVelocityX(0);
    }
    // Prevent player from dashing too far right
    if (player.x > PLAYER_MAX_X) {
      player.x = PLAYER_MAX_X;
      if (isSprinting && player.body.velocity.x > 0) {
        player.body.setVelocityX(0); // Stop forward motion if hitting boundary
      }
    }

    // --- Jumping ---
    if (
      isTouchingGround &&
      jumpKeyPressed &&
      !isDucking &&
      webSlowState !== "entering" && // Can't jump if actively slowed
      webSlowState !== "stuck"
    ) {
      player.body.setVelocityY(JUMP_VELOCITY);
    }

    // --- Variable Jump Height / Faster Fall ---
    // Only apply if gravity is enabled (i.e., not stuck in web)
    if (player.body.allowGravity) {
      if (!isTouchingGround && jumpKeyReleased && player.body.velocity.y < 0) {
        player.body.gravity.y =
          config.physics.arcade.gravity.y * JUMP_VARIABLE_GRAVITY_MULTIPLIER;
      } else {
        player.body.gravity.y = config.physics.arcade.gravity.y;
      }
    }
    // If allowGravity is false, the web logic is controlling it

    // --- Ducking ---
    if (cursors.down.isDown && isTouchingGround && !isDucking) {
      // Cannot start ducking while sprinting
      if (!isSprinting) {
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
      }
    } else if (isDucking && (!cursors.down.isDown || !isTouchingGround)) {
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

    // --- Sprint Activation ---
    if (
      sprintKeyPressed &&
      hasSprintPowerUp &&
      !isSprinting &&
      !isDucking && // Cannot sprint while ducking
      !isSlowed && // Cannot sprint while slowed
      webSlowState === "none" && // Prevent sprint during web slow
      isTouchingGround // Can only start sprint while on ground
    ) {
      startSprint.call(this);
    }

    // --- Update Ground Status for Next Frame ---
    wasTouchingGround = isTouchingGround;
  } // End player control check

  // --- Difficulty Increase ---
  // Base scroll speed increases constantly over time
  scrollSpeed += 0.0022 * deltaFactor; // was 0.0015

  // --- Game Over Check (Player pushed off screen left) ---
  // Use getBounds().right check as before
  if (player && player.active && player.getBounds().right < 0 && !isGameOver) {
    gameOver.call(this);
  }
} // End update
