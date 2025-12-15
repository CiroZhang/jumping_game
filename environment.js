class Player {
  static PLAYER_WIDTH = 200;
  static PLAYER_HEIGHT = 150;

  constructor(movePower, jumpPower, x, y) {
    this.movePower = movePower;
    this.jumpPower = jumpPower;

    this.velocityX = 0;
    this.velocityY = 0;
    this.x = x;
    this.y = y;

    this.isOnFloor = true;
    this.direction = "left";

    this.element = document.querySelector("#text");
    this.element.style.width = `${Player.PLAYER_WIDTH}px`;
    this.element.style.height = `${Player.PLAYER_HEIGHT}px`;
    this.element.style.zIndex = "10";
  }

  updatePosition() {
    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  updateSprite() {
    const spriteState = this.isOnFloor ? "" : "_jump";
    this.element.src = `assets/player_${this.direction}${spriteState}.png`;
  }

  render() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  moveLeft() {
    this.direction = "left";
    this.velocityX = -this.movePower;
  }

  moveRight() {
    this.direction = "right";
    this.velocityX = this.movePower;
  }

  jump() {
    if (this.isOnFloor) {
      this.isOnFloor = false;
      this.velocityY = -this.jumpPower;
    }
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + Player.PLAYER_WIDTH,
      top: this.y,
      bottom: this.y + Player.PLAYER_HEIGHT
    };
  }
}

class Coin {
  static COIN_SIZE = 40;
  static FALL_SPEED = 2;

  constructor(x, y, emoji = "🪙") {
    this.x = x;
    this.y = y;
    this.velocityY = Coin.FALL_SPEED;
    this.collected = false;


    this.element = document.createElement("div");
    this.element.style.position = "absolute";
    this.element.style.width = `${Coin.COIN_SIZE}px`;
    this.element.style.height = `${Coin.COIN_SIZE}px`;
    this.element.style.fontSize = `${Coin.COIN_SIZE}px`;
    this.element.style.lineHeight = `${Coin.COIN_SIZE}px`;
    this.element.style.textAlign = "center";
    this.element.style.pointerEvents = "none";
    this.element.style.filter = "drop-shadow(2px 2px 4px rgba(0,0,0,0.3))";
    this.element.style.transition = "transform 0.1s";
    this.element.style.zIndex = "5";
    this.element.textContent = emoji;
    document.body.appendChild(this.element);
  }

  update() {
    this.y += this.velocityY;
  }

  render() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + Coin.COIN_SIZE,
      top: this.y,
      bottom: this.y + Coin.COIN_SIZE
    };
  }

  remove() {
    this.element.remove();
  }
}

class FloatingCoin {
  static COIN_SIZE = 50;
  static FLOAT_AMPLITUDE = 15;
  static FLOAT_SPEED = 0.03;

  constructor(x, y) {
    this.x = x;
    this.baseY = y;
    this.y = y;
    this.collected = false;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.time = 0;


    this.element = document.createElement("div");
    this.element.style.position = "absolute";
    this.element.style.width = `${FloatingCoin.COIN_SIZE}px`;
    this.element.style.height = `${FloatingCoin.COIN_SIZE}px`;
    this.element.style.fontSize = `${FloatingCoin.COIN_SIZE}px`;
    this.element.style.lineHeight = `${FloatingCoin.COIN_SIZE}px`;
    this.element.style.textAlign = "center";
    this.element.style.pointerEvents = "none";
    this.element.style.filter = "drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))";
    this.element.style.animation = "sparkle 1.5s infinite";
    this.element.style.zIndex = "5";
    this.element.textContent = "⭐";
    document.body.appendChild(this.element);
  }

  update() {
    this.time += FloatingCoin.FLOAT_SPEED;
    this.y = this.baseY + Math.sin(this.time + this.floatOffset) * FloatingCoin.FLOAT_AMPLITUDE;
  }

  render() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
    this.element.style.transform = `rotate(${Math.sin(this.time) * 10}deg)`;
  }

  getBounds() {
    return {
      left: this.x,
      right: this.x + FloatingCoin.COIN_SIZE,
      top: this.y,
      bottom: this.y + FloatingCoin.COIN_SIZE
    };
  }

  remove() {
    this.element.remove();
  }
}

export class Environment {
  static FLOOR_Y = 500;
  static GRAVITY = 0.1;
  static FRICTION = 0.95;
  static COIN_SPAWN_INTERVAL = 2000; 
  static FLOATING_COIN_SPAWN_INTERVAL = 5000; 

  constructor() {
    this.floor = Environment.FLOOR_Y;
    this.gravity = Environment.GRAVITY;
    this.friction = Environment.FRICTION;
    this.player = new Player(5, 10, 0, this.floor);

    this.coins = [];
    this.floatingCoins = [];
    this.score = 0;
    this.lastCoinSpawn = Date.now();
    this.lastFloatingCoinSpawn = Date.now();

    this.createVisuals();
  }

  createVisuals() {
    this.floorElement = document.createElement("div");
    this.floorElement.style.position = "absolute";
    this.floorElement.style.bottom = "0";
    this.floorElement.style.left = "0";
    this.floorElement.style.width = "100%";
    this.floorElement.style.height = `${window.innerHeight - Environment.FLOOR_Y}px`;
    this.floorElement.style.background = "linear-gradient(to bottom, #4DA8DA 0%, #3B7EA1 50%, #2E5F7D 100%)";
    this.floorElement.style.borderTop = "5px solid #3498db";
    this.floorElement.style.boxShadow = "inset 0 10px 20px rgba(0,0,0,0.2)";
    this.floorElement.style.overflow = "hidden";
    this.floorElement.style.zIndex = "1";
    document.body.appendChild(this.floorElement);

    for (let i = 0; i < 3; i++) {
      const wave = document.createElement("div");
      wave.style.position = "absolute";
      wave.style.top = `${i * 15}px`;
      wave.style.left = "0";
      wave.style.width = "200%";
      wave.style.height = "30px";
      wave.style.background = "rgba(255, 255, 255, 0.1)";
      wave.style.borderRadius = "50%";
      wave.style.animation = `wave ${3 + i}s infinite linear`;
      wave.style.animationDelay = `${i * 0.5}s`;
      this.floorElement.appendChild(wave);
    }

    this.scoreElement = document.createElement("div");
    this.scoreElement.style.position = "absolute";
    this.scoreElement.style.top = "20px";
    this.scoreElement.style.left = "20px";
    this.scoreElement.style.fontSize = "32px";
    this.scoreElement.style.fontWeight = "bold";
    this.scoreElement.style.color = "#FFD700";
    this.scoreElement.style.textShadow = "3px 3px 6px rgba(0,0,0,0.8)";
    this.scoreElement.style.fontFamily = "Arial, sans-serif";
    this.scoreElement.style.padding = "10px 20px";
    this.scoreElement.style.background = "rgba(0, 0, 0, 0.5)";
    this.scoreElement.style.borderRadius = "15px";
    this.scoreElement.style.border = "3px solid #FFD700";
    this.scoreElement.style.zIndex = "100";
    this.scoreElement.textContent = `🪙 ${this.score}`;
    document.body.appendChild(this.scoreElement);
  }

  applyGravity() {
    if (!this.player.isOnFloor) {
      this.player.velocityY += this.gravity;
    }
    if (this.player.y >= this.floor) {
      this.player.y = this.floor;
      this.player.isOnFloor = true;
    }
  }

  applyFriction() {
    this.player.velocityX *= this.friction;
  }

  applyBoundaries() {
    if (this.player.x < 0) {
      this.player.x = 0;
      this.player.velocityX = 0;
    }
    if (this.player.x + Player.PLAYER_WIDTH > window.innerWidth) {
      this.player.x = window.innerWidth - Player.PLAYER_WIDTH;
      this.player.velocityX = 0;
    }

    if (this.player.y < 0) {
      this.player.y = 0;
      this.player.velocityY = 0;
    }
  }

  spawnCoin() {
    const now = Date.now();
    if (now - this.lastCoinSpawn > Environment.COIN_SPAWN_INTERVAL) {
      const x = Math.random() * (window.innerWidth - Coin.COIN_SIZE);
      const y = -Coin.COIN_SIZE;
      this.coins.push(new Coin(x, y));
      this.lastCoinSpawn = now;
    }
  }

  spawnFloatingCoin() {
    const now = Date.now();
    if (now - this.lastFloatingCoinSpawn > Environment.FLOATING_COIN_SPAWN_INTERVAL) {
      const x = Math.random() * (window.innerWidth - FloatingCoin.COIN_SIZE);
      const y = 150 + Math.random() * 200; 
      this.floatingCoins.push(new FloatingCoin(x, y));
      this.lastFloatingCoinSpawn = now;
    }
  }

  updateCoins() {
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      coin.update();

      if (this.checkCollision(this.player.getBounds(), coin.getBounds())) {
        this.collectCoin(coin, 1);
        this.coins.splice(i, 1);
      }
      else if (coin.y > window.innerHeight) {
        coin.remove();
        this.coins.splice(i, 1);
      }
    }

    for (let i = this.floatingCoins.length - 1; i >= 0; i--) {
      const coin = this.floatingCoins[i];
      coin.update();

      if (this.checkCollision(this.player.getBounds(), coin.getBounds())) {
        this.collectCoin(coin, 5); 
        this.floatingCoins.splice(i, 1);
      }
    }
  }

  collectCoin(coin, points) {
    this.createParticles(coin.x + coin.getBounds().right / 2, coin.y + coin.getBounds().bottom / 2);
    coin.remove();
    this.score += points;
    this.scoreElement.textContent = `🪙 ${this.score}`;
  }

  createParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement("div");
      particle.style.position = "absolute";
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = "10px";
      particle.style.height = "10px";
      particle.style.borderRadius = "50%";
      particle.style.background = "#FFD700";
      particle.style.pointerEvents = "none";
      particle.style.zIndex = "50";
      particle.style.animation = `explode${i} 0.6s ease-out forwards`;
      document.body.appendChild(particle);

      setTimeout(() => particle.remove(), 600);
    }
  }

  checkCollision(rect1, rect2) {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  update() {
    this.applyFriction();
    this.applyGravity();
    this.player.updatePosition();
    this.applyBoundaries();
    this.player.updateSprite();
    this.player.render();

    this.spawnCoin();
    this.spawnFloatingCoin();
    this.updateCoins();

    this.coins.forEach(coin => coin.render());
    this.floatingCoins.forEach(coin => coin.render());
  }

  handleInput(keys) {
    if (keys.left) this.player.moveLeft();
    if (keys.right) this.player.moveRight();
    if (keys.up) this.player.jump();
  }
}
