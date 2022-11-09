const ghostColors = ['red', 'pink', 'cyan', 'yellow']

class Ghost {
  constructor(color, startX, startY) {
    // grid position
    this.startPos = {
      x: startX,
      y: startY,
    }
    this.gridPos = {
      x: startX,
      y: startY,
    }
    this.nextPos = {
      x: startX,
      y: startY,
    }
    this.moveDir = {
      x: 0,
      y: 0,
    }

    // path
    this.controller = new AbortController()
    this.path = null

    // canvas positoin
    const { x, y } = grid.gridToCanvasPos(startX, startY)
    this.x = x
    this.y = y

    // properties
    this.followSpeed = 100
    this.inBoxSpeed = 50
    this.scaredSpeed = 50
    this.eatenSpeed = 300
    this.respawnTimer = 0
    this.scaredTimer = 0

    // images
    this.imgNormal = imgLoader.images.get('ghost_' + color)
    this.imgScared = imgLoader.images.get('ghost_scared')
    this.imgEyes = imgLoader.images.get('ghost_eyes')
    this.img = this.imgNormal

    // fsm
    this.fsm = new Fsm(this)
    this.fsm.setState(stateInBox)

    // events
    player.event.addEventListener('powerup', () => {
      this.fsm.setState(stateScared)
    })
  }

  update() {
    this.fsm.update()
  }

  isMoveDone() {
    return this.gridPos.x == this.nextPos.x && this.gridPos.y == this.nextPos.y
  }

  canMove(pos, dir) {
    const nextX = pos.x + dir.x
    const nextY = pos.y + dir.y
    return grid.is_in_bounds(nextX, nextY) && !['wall', 'gate'].includes(grid.at(nextX, nextY))
  }

  move(speed) {
    // check wall for input direction
    if (this.canMove(this.gridPos, this.moveDir)) {
      this.nextPos.x = this.gridPos.x + this.moveDir.x
      this.nextPos.y = this.gridPos.y + this.moveDir.y
    }

    // move
    const nextCanvasPos = grid.gridToCanvasPos(this.nextPos.x, this.nextPos.y)
    this.x = moveTowards(this.x, nextCanvasPos.x, speed * deltaTime)
    this.y = moveTowards(this.y, nextCanvasPos.y, speed * deltaTime)

    // update position
    this.x == nextCanvasPos.x && (this.gridPos.x = this.nextPos.x)
    this.y == nextCanvasPos.y && (this.gridPos.y = this.nextPos.y)
  }

  followPath(speed) {
    if (this.path === null) {
      return
    }

    if (this.path.length == 0) {
      return
    }

    this.nextPos.x = this.path[0].x
    this.nextPos.y = this.path[0].y

    // move
    const nextCanvasPos = grid.gridToCanvasPos(this.nextPos.x, this.nextPos.y)
    this.x = moveTowards(this.x, nextCanvasPos.x, speed * deltaTime)
    this.y = moveTowards(this.y, nextCanvasPos.y, speed * deltaTime)

    // update position
    this.x == nextCanvasPos.x && (this.gridPos.x = this.nextPos.x)
    this.y == nextCanvasPos.y && (this.gridPos.y = this.nextPos.y)

    if (this.x == nextCanvasPos.x && this.y == nextCanvasPos.y) {
      this.path.splice(0, 1)
    }
  }

  draw() {
    ctx.drawImage(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2)
  }
}
