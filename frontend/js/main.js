let ghosts = null

function start() {
  player.init(12, 22)
  ghosts = [
    new Ghost('red', 12, 14),
    new Ghost('pink', 13, 14),
    new Ghost('cyan', 14, 14),
    new Ghost('yellow', 15, 14),
  ]
}

function mainLoop() {
  // calculate delta time
  deltaTime = (performance.now() - startTime) / 1000
  startTime = performance.now()

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

  // TODO: draw text
  if (playerDead) {
    console.log('you lose!')
  }

  if (score == totalScore) {
    console.log('you win!')
  }

  requestAnimationFrame(mainLoop)
}
