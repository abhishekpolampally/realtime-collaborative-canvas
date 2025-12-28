const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const socket = new WebSocket("ws://localhost:3000");

let drawing = false;
let last = null;
const userColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
let buffer = [];

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  last = { x: e.offsetX, y: e.offsetY };
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;
  const current = { x: e.offsetX, y: e.offsetY };
  drawLine(last, current, userColor, 2);
  sendStroke(last, current);
  last = current;
});

canvas.addEventListener("mouseup", () => (drawing = false));

const drawLine = (from, to, color, width) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
};

const sendStroke = (from, to) => {
  const data = { from, to, color: userColor, width: 2 };
  buffer.push(data);
};

socket.onmessage = async (message) => {
  let rawData = message.data;
  if (rawData instanceof Blob) {
    rawData = await rawData.text();
  }
  const { batch } = JSON.parse(rawData);
  batch.forEach(({ from, to, color, width }) =>
    drawLine(from, to, color, width)
  );
};

setInterval(() => {
  if (buffer.length) {
    socket.send(JSON.stringify({ batch: buffer }));
    buffer = [];
  }
}, 100);

// TODO: Enhancements
// 1. Use requestAnimationFrame
// 2. Handle heartbeats (Websocket failures)
// 3. Persist strokes (So new users can see drawings before they connected)
