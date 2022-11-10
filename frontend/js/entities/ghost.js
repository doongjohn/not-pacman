class Ghost {
  constructor(color, startX, startY) {
    // grid position
    this.startPos = {
      x: startX,
      y: startY,
    }
    this.pos = {
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

    // roam
    this.roamTime = 0
    this.roamTimer = 0

    // follow
    this.followSpeed = 100
    this.followTime = 0
    this.followTimer = 0

    // in box
    this.inBoxSpeed = 50

    // frightened
    this.frightenedSpeed = 50
    this.frightenedTimer = 0

    // eaten
    this.eatenSpeed = 300
    this.respawnTimer = 0

    // images
    this.imgNormal = imgLoader.images.get('ghost_' + color)
    this.imgScared = imgLoader.images.get('ghost_scared')
    this.imgEaten = imgLoader.images.get('ghost_eyes')
    this.img = this.imgNormal

    // fsm
    this.fsm = new Fsm(this)
    this.fsm.setState(stateInBox)

    // events
    player.event.addEventListener('powerup', () => {
      this.fsm.setState(stateFrightened)
    })
  }

  update() {
    this.fsm.update()

    // kill player
    if (![stateFrightened, stateEaten].includes(this.fsm.currentState)) {
      const playerCollide = Math.abs(player.x - this.x) < 10 && Math.abs(player.y - this.y) < 10
      if (playerCollide) {
        playerDead = true
      }
    }
  }

  isMoveDone() {
    return this.pos.x == this.nextPos.x && this.pos.y == this.nextPos.y
  }

  canMove(pos, dir) {
    const nextX = pos.x + dir.x
    const nextY = pos.y + dir.y
    return grid.is_in_bounds(nextX, nextY) && !['wall', 'gate'].includes(grid.at(nextX, nextY))
  }

  move(speed) {
    // check wall for input direction
    if (this.isMoveDone() && this.canMove(this.pos, this.moveDir)) {
      this.nextPos.x = this.pos.x + this.moveDir.x
      this.nextPos.y = this.pos.y + this.moveDir.y
    }

    // move
    const nextCanvasPos = grid.gridToCanvasPos(this.nextPos.x, this.nextPos.y)
    this.x = moveTowards(this.x, nextCanvasPos.x, speed * deltaTime)
    this.y = moveTowards(this.y, nextCanvasPos.y, speed * deltaTime)

    // update grid position
    this.x == nextCanvasPos.x && (this.pos.x = this.nextPos.x)
    this.y == nextCanvasPos.y && (this.pos.y = this.nextPos.y)
  }

  followPath(speed) {
    if (this.path == null) {
      return
    }

    if (this.path.length == 0) {
      return
    }

    // update next pos
    this.nextPos.x = this.path[0].x
    this.nextPos.y = this.path[0].y

    // update move dir
    this.moveDir.x = this.nextPos.x - this.pos.x
    this.moveDir.y = this.nextPos.y - this.pos.y

    // move
    const nextCanvasPos = grid.gridToCanvasPos(this.nextPos.x, this.nextPos.y)
    this.x = moveTowards(this.x, nextCanvasPos.x, speed * deltaTime)
    this.y = moveTowards(this.y, nextCanvasPos.y, speed * deltaTime)

    // update grid position
    this.x == nextCanvasPos.x && (this.pos.x = this.nextPos.x)
    this.y == nextCanvasPos.y && (this.pos.y = this.nextPos.y)

    // remove path
    if (this.isMoveDone() && this.x == nextCanvasPos.x && this.y == nextCanvasPos.y) {
      this.path.splice(0, 1)
    }
  }

  draw() {
    ctx.drawImage(this.img, this.x - this.img.width / 2, this.y - this.img.height / 2)
  }

  getPath(dest, signal = null) {
    postData(
      '/get-path-json',
      {
        start: {
          x: this.pos.x,
          y: this.pos.y,
        },
        dest: dest,
      },
      signal
    )
      .then((response) => response.json())
      .then((json) => {
        this.path = json
        if (this.path.length > 1) {
          this.path.splice(0, 1) // remove starting position
        }
      })
      .catch((err) => {
        if (err.name == 'AbortError') {
          console.log('fetch aborted')
          return
        }
        console.error('/get-path-json')
        console.error(err)
      })
  }

  cmpByDistFar() {
    return (a, b) => {
      const distA =
        (player.pos.x - (this.pos.x + a.x)) ** 2 + (player.pos.y - (this.pos.y + a.y)) ** 2
      const distB =
        (player.pos.x - (this.pos.x + b.x)) ** 2 + (player.pos.y - (this.pos.y + b.y)) ** 2
      if (distA > distB) {
        return -1
      }
      if (distA < distB) {
        return 1
      }
      if (distA == distB) {
        return randomRange(0, 2) == 0 ? -1 : 1
      }
    }
  }
}
