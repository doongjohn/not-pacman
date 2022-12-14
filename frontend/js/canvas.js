const canvasContainer = document.getElementById('canvas-container')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

ctx.imageSmoothingEnabled = false
ctx.webkitImageSmoothingEnabled = false
ctx.mozImageSmoothingEnabled = false
ctx.oImageSmoothingEnabled = false
ctx.msImageSmoothingEnabled = false

canvas.style.background = '#242424'
canvas.width = canvasContainer.offsetWidth
canvas.height = canvasContainer.offsetHeight

window.addEventListener('resize', () => {
  canvas.width = canvasContainer.offsetWidth
  canvas.height = canvasContainer.offsetHeight
})

function screenToCanvasPosition(x, y) {
  var rect = canvas.getBoundingClientRect()
  return {
    x: x - rect.left,
    y: y - rect.top,
  }
}

function drawText(x, y, size, text) {
  ctx.font = size + 'px "Hunter"'
  ctx.fillText(text, x, y)
}
