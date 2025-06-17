export function createRoad(x1, y1, x2, y2) {
  return { x1, y1, x2, y2 };
}

export function drawRoad(ctx, road) {
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(road.x1, road.y1);
  ctx.lineTo(road.x2, road.y2);
  ctx.stroke();
}