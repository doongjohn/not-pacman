let ghosts = null

function start() {
  player.init(12, 22)
  ghosts = [
    new Ghost(ghostColors[0], 12, 14),
    new Ghost(ghostColors[1], 13, 14),
    new Ghost(ghostColors[2], 14, 14),
    new Ghost(ghostColors[3], 15, 14),
  ]
}

function mainLoop() {
  // calculate delta time
  deltaTime = (performance.now() - startTime) / 1000
  startTime = performance.now()

  gameTimer += deltaTime

  // clear screen
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (playerDead || score == totalScore) {
    deltaTime = 0
  }

  backgroundGrid.draw()
  grid.draw()

  player.move()
  player.draw()

  for (let ghost of ghosts) {
    ghost.update()
    ghost.draw()
  }

  if (playerDead) {
    console.log('you lose!')
  }

  if (score == totalScore) {
    console.log('you win!')
  }

  requestAnimationFrame(mainLoop)
}
