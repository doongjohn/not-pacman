const player = {
  init(startX, startY) {
    // grid position
    this.pos = {
      x: startX,
      y: startY,
    }
    this.nextPos = {
      x: startX,
      y: startY,
    }

    // canvas position
    const { x, y } = grid.gridToCanvasPos(startX, startY)
    this.x = x
    this.y = y

    // events
    this.event = new GameEvent()
    this.eventPowerUp = new Event('powerup')

    // animation
    this.time = 0
    this.spriteIndex = 0
    this.spriteSheet = [
      imgLoader.images.get('pacman_r0'),
      imgLoader.images.get('pacman_r1'),
      imgLoader.images.get('pacman_r2'),
      imgLoader.images.get('pacman_r1'),
    ]

    // movement
    this.speed = 100
    this.inputDir = { x: 0, y: 0 }
    this.moveDir = { x: 0, y: 0 }
    window.addEventListener('keydown', (event) => {
      if (['w', 'ArrowUp'].includes(event.key)) {
        this.inputDir.x = 0
        this.inputDir.y = 1
      }
      if (['s', 'ArrowDown'].includes(event.key)) {
        this.inputDir.x = 0
        this.inputDir.y = -1
      }
      if (['d', 'ArrowRight'].includes(event.key)) {
        this.inputDir.x = 1
        this.inputDir.y = 0
      }
      if (['a', 'ArrowLeft'].includes(event.key)) {
        this.inputDir.x = -1
        this.inputDir.y = 0
      }
    })
  },

  getTile() {
    return grid.at(this.pos.x, this.pos.y)
  },

  canMove(pos, dir) {
    const nextX = pos.x + dir.x
    const nextY = pos.y - dir.y
    return grid.is_in_bounds(nextX, nextY) && !['wall', 'gate'].includes(grid.at(nextX, nextY))
  },

  move() {
    if (this.getTile() == 'score') {
      score += 1
      grid.set(this.pos.x, this.pos.y, '')
    }
    if (this.getTile() == 'powerup') {
      score += 1
      grid.set(this.pos.x, this.pos.y, '')
      // trigger event
      this.event.dispatchEvent(this.eventPowerUp)
    }

    // check wall for input direction
    if (this.canMove(this.nextPos, this.inputDir)) {
      this.moveDir = { ...this.inputDir }
    }

    // check wall for movement direction
    if (this.canMove(this.pos, this.moveDir)) {
      this.nextPos.x = this.pos.x + this.moveDir.x
      this.nextPos.y = this.pos.y - this.moveDir.y
    } else {
      this.moveDir.x = 0
      this.moveDir.y = 0
    }

    // move
    const nextCanvasPos = grid.gridToCanvasPos(this.nextPos.x, this.nextPos.y)
    this.x = moveTowards(this.x, nextCanvasPos.x, this.speed * deltaTime)
    this.y = moveTowards(this.y, nextCanvasPos.y, this.speed * deltaTime)

    // update grid position
    this.x == nextCanvasPos.x && (this.pos.x = this.nextPos.x)
    this.y == nextCanvasPos.y && (this.pos.y = this.nextPos.y)
  },

  draw() {
    let dirChar = ''
    this.moveDir.x == +1 && (dirChar = 'r')
    this.moveDir.x == -1 && (dirChar = 'l')
    this.moveDir.y == +1 && (dirChar = 'u')
    this.moveDir.y == -1 && (dirChar = 'd')
    if (dirChar != '') {
      this.spriteSheet = [
        imgLoader.images.get('pacman_' + dirChar + '0'),
        imgLoader.images.get('pacman_' + dirChar + '1'),
        imgLoader.images.get('pacman_' + dirChar + '2'),
        imgLoader.images.get('pacman_' + dirChar + '1'),
      ]
    }

    this.time += deltaTime
    if (this.time >= 0.05) {
      // animation
      this.time = 0
      this.spriteIndex = (this.spriteIndex + 1) % this.spriteSheet.length
    }
    const img = this.spriteSheet[this.spriteIndex]
    ctx.drawImage(img, this.x - img.width / 2, this.y - img.height / 2)
  },
}
