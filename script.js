 // The JavaScript code remains the same as in the previous version
 const canvas = document.getElementById('signature-pad');
 const ctx = canvas.getContext('2d');
 let isDrawing = false;
 let lastX = 0;
 let lastY = 0;
 let paths = [];
 let currentPath = [];
 let undoStack = [];
 let redoStack = [];

 function initializeCanvas() {
     ctx.strokeStyle = document.getElementById('pen-color').value;
     ctx.lineWidth = document.getElementById('pen-size').value;
     ctx.lineCap = 'round';
     ctx.lineJoin = 'round';
 }

 initializeCanvas();

 function startDrawing(e) {
     isDrawing = true;
     [lastX, lastY] = getMousePos(canvas, e);
     currentPath = [{x: lastX, y: lastY}];
     redoStack = [];
 }

 function draw(e) {
     if (!isDrawing) return;

     const [currentX, currentY] = getMousePos(canvas, e);

     ctx.beginPath();
     ctx.moveTo(lastX, lastY);
     ctx.lineTo(currentX, currentY);
     ctx.stroke();

     currentPath.push({x: currentX, y: currentY});
     [lastX, lastY] = [currentX, currentY];

     updateStatus(`Drawing at position: ${Math.round(currentX)}, ${Math.round(currentY)}`);
 }

 function stopDrawing() {
     if (!isDrawing) return;
     isDrawing = false;
     paths.push({
         points: currentPath,
         color: ctx.strokeStyle,
         width: ctx.lineWidth
     });
     undoStack.push(paths.length - 1);
     updateStatus('Drawing stopped');
 }

 function getMousePos(canvas, e) {
     const rect = canvas.getBoundingClientRect();
     return [
         (e.clientX - rect.left) * (canvas.width / rect.width),
         (e.clientY - rect.top) * (canvas.height / rect.height)
     ];
 }

 function redrawCanvas() {
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     paths.forEach(path => {
         if (path) {
             ctx.beginPath();
             ctx.strokeStyle = path.color;
             ctx.lineWidth = path.width;
             ctx.moveTo(path.points[0].x, path.points[0].y);
             path.points.forEach(point => {
                 ctx.lineTo(point.x, point.y);
             });
             ctx.stroke();
         }
     });
 }

 function undo() {
     if (undoStack.length === 0) return;
     const pathIndex = undoStack.pop();
     redoStack.push(paths[pathIndex]);
     paths[pathIndex] = null;
     redrawCanvas();
     updateStatus('Undo performed');
 }

 function redo() {
     if (redoStack.length === 0) return;
     const path = redoStack.pop();
     paths.push(path);
     undoStack.push(paths.length - 1);
     redrawCanvas();
     updateStatus('Redo performed');
 }

 function updateStatus(message) {
     document.getElementById('status-bar').textContent = message;
 }

 canvas.addEventListener('mousedown', startDrawing);
 canvas.addEventListener('mousemove', draw);
 canvas.addEventListener('mouseup', stopDrawing);
 canvas.addEventListener('mouseout', stopDrawing);

 canvas.addEventListener('touchstart', (e) => {
     e.preventDefault();
     startDrawing(e.touches[0]);
 });
 canvas.addEventListener('touchmove', (e) => {
     e.preventDefault();
     draw(e.touches[0]);
 });
 canvas.addEventListener('touchend', stopDrawing);

 document.getElementById('pen-color').addEventListener('input', (e) => {
     ctx.strokeStyle = e.target.value;
     updateStatus(`Color changed to: ${e.target.value}`);
 });

 document.getElementById('pen-size').addEventListener('input', (e) => {
     ctx.lineWidth = e.target.value;
     document.getElementById('pen-size-value').textContent = e.target.value;
     updateStatus(`Pen size changed to: ${e.target.value}px`);
 });

 document.getElementById('undo').addEventListener('click', undo);
 document.getElementById('redo').addEventListener('click', redo);
 document.getElementById('clear').addEventListener('click', () => {
     paths = [];
     undoStack = [];
     redoStack = [];
     ctx.clearRect(0, 0, canvas.width, canvas.height);
     updateStatus('Canvas cleared');
 });

 function downloadCanvas(format) {
     const link = document.createElement('a');
     let dataURL;
     
     switch(format) {
         case 'png':
             dataURL = canvas.toDataURL('image/png');
             link.download = 'signature.png';
             break;
         case 'jpg':
             dataURL = canvas.toDataURL('image/jpeg');
             link.download = 'signature.jpg';
             break;
         case 'svg':
             const svgData = generateSVG();
             dataURL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
             link.download = 'signature.svg';
             break;
     }
     
     link.href = dataURL;
     link.click();
     updateStatus(`Downloaded as ${format.toUpperCase()}`);
 }

 function generateSVG() {
     let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">`;
     paths.forEach(path => {
         if (path) {
             svg += `<path d="M ${path.points.map(p => `${p.x},${p.y}`).join(' L ')}" 
                 stroke="${path.color}" 
                 stroke-width="${path.width}" 
                 fill="none" 
                 stroke-linecap="round" 
                 stroke-linejoin="round"/>`;
         }
     });
     svg += '</svg>';
     return svg;
 }

 document.getElementById('download').addEventListener('click', () => downloadCanvas('png'));
 document.getElementById('download-png').addEventListener('click', () => downloadCanvas('png'));
 document.getElementById('download-jpg').addEventListener('click', () => downloadCanvas('jpg'));
 document.getElementById('download-svg').addEventListener('click', () => downloadCanvas('svg'));