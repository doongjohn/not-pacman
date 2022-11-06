const canvasContainer = document.getElementById('canvas-container')
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
ctx.imageSmoothingEnabled = false

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
