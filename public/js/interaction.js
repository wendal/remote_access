var can = document.createElement('canvas')
// $('body').prepend($(can));
can.style.backgroundColor = "blue";
var ctx = can.getContext("2d");
function setCursor(data){
  // console.log(data.offset, data.size, data.base64.length);
  var dataUrl = "data:image/png;base64," + data.base64;
  var img = document.createElement('img');
  img.src = dataUrl;

  can.width = data.size.Width;
  can.height = data.size.Height;
  can.style.width = data.size.Width + 'px';
  can.style.height = data.size.Height + 'px';

  ctx.shadowColor = "black";
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 3;
  ctx.drawImage(img, 0,0);

  var dataUrl = can.toDataURL('image/png')
  var cursorStyle = 'url(' + dataUrl + ') ' + data.offset[0] + " " + data.offset[1] +', auto'; 
  canvas.style.cursor = cursorStyle;
  // setTimeout(function(){
  //   canvas.style.cursor = cursorStyle;
  // },10);
}

window.angle = 0;
function setOrientation(value){
  switch(value){
    case 0: angle = 0;break;
    case 1: angle = -90;break;
    case 2: angle = -180;break;
    case 3: angle = 90;break;
  }
  canvas.style.transform = "rotate(" + angle.toString() + "deg)";
}

function initInteractions(){
	canvas.tabIndex = 1000;
  canvas.addEventListener("mousedown", doMouseDown, false);
  canvas.addEventListener("mouseup", doMouseUp, false);
  canvas.addEventListener("mousemove", doMouseMove, false);
  canvas.addEventListener("keydown", doKeyDown, false);
  canvas.addEventListener("keyup", doKeyUp, false);
  canvas.addEventListener("mouseleave", doMouseLeave, false);
  // canvas.contenteditable = true;
  // canvas.addEventListener("WheelEvent", doMouseWheel, false);
  // canvas.addEventListener('mousewheel', doMouseWheel, false);

  addWheelListener(canvas, doMouseWheel);
  // $(canvas).mousewheel(fdoMouseWheel);
  canvas.addEventListener("touchstart", doTouchStart, false);
  canvas.addEventListener("touchmove", doTouchMove, false);
  canvas.addEventListener("touchend", doTouchEnd, false);
  canvas.oncontextmenu = new Function("return false");
  
  function doKeyDown(e){
    sendKey(1,e.keyCode,e.altKey,e.shiftKey,e.ctrlKey);
    e.cancelBubble = true;
    if( e.stopPropagation ) e.stopPropagation();
    e.preventDefault();
    return false;
  }

  function doKeyUp(e){
    sendKey(0,e.keyCode,e.altKey,e.shiftKey,e.ctrlKey);
    e.cancelBubble = true;
    if( e.stopPropagation ) e.stopPropagation();
    e.preventDefault();
    return false;
  }

  var mouseDown = 0;
  function doMouseDown(e){
    // e.target.onmousemove = doMouseMove;
    var type = (e.button == 2 ? 4 : 1);
    mouseDown = type;
    sendMouse(type, e);
    e.cancelBubble = true;
    if( e.stopPropagation ) e.stopPropagation();
  }
  function doMouseUp(e){
    // e.target.onmousemove = null;
    var type = (e.button == 2 ? 3 : 0);
    mouseDown = type;
    sendMouse(type, e);
    e.cancelBubble = true;
    if( e.stopPropagation ) e.stopPropagation();
  }
  function doMouseMove(e){
    if(canvas.android && mouseDown != 1)
      return;
    sendMouse(2, e);
    // e.cancelBubble = true;
    // if( e.stopPropagation ) e.stopPropagation();
  }
  var newX = 0;
  var newY = 0;
  function sendMouse(down, e){
    // console.log(e.offsetX, e.layerX, e.offsetY, e.layerY)
    // newX = (e.offsetX || e.layerX)/canvas.width;
    // newX = newX + (newX * 0.0054);
    // newY = (e.offsetY || e.layerY)/canvas.height;
    var cords = getcords(e);
    newX = cords[0] / canvas.width;
    newY = cords[1] / canvas.height;
    sendMouseWS(down,newX,newY);
  }
  function doMouseLeave(e){
    if(mouseDown == 1 || mouseDown == 4){
      e.target.onmousemove = null;
      mouseDown = (mouseDown == 1 ? 0 : 3);
      sendMouseWS(0,newX,newY);
    }
  }

  function getcords(event){
      var canvasMouseX = event.clientX - (canvas.offsetLeft - window.pageXOffset);
      var canvasMouseY = event.clientY - (canvas.offsetTop - window.pageYOffset);
      return [canvasMouseX, canvasMouseY];
  }
  function sendMouseWS(down, x, y){
    var cords = !canvas.android ? [x,y] : rotate(x, y);
    send([down,cords[0],cords[1]]);
  }
  function sendKey(down,key,alt,shift,ctrl){
    send([down,key != 224 ? key : 91,alt ? 1 : 0,shift ? 1 : 0,ctrl ? 1 : 0]);
  }
  window.sendSpecial = function(action){
      send([action]);
  }
  var scroll = true;
  function doMouseWheel(e){
    if(canvas.android)
      return;
    var x = Math.round(e.deltaX);
    var y = -Math.round(e.deltaY);

    if(window.platform == 'win') {
      send([x/2,y/2]);
    }
    else
      send([x,y]);
    e.cancelBubble = true;
    if( e.stopPropagation ) e.stopPropagation();
    e.preventDefault();
    return false
  }
  function doTouchStart(e){
    console.log(e);
    e.cancelBubble = true;
    if( e.stopPropagation ) e.stopPropagation();
  }
  function doTouchMove(e){
    console.log(e);
    e.cancelBubble = true;
    if( e.stopPropagation ) e.stopPropagation();
  }
  function doTouchEnd(e){
    console.log(e);
    e.cancelBubble = true;
    if( e.stopPropagation ) e.stopPropagation();
  }

  function rotate(x, y) {
    var xm = 1/2,
    ym = 1/2,
    cos = Math.cos;
    sin = Math.sin;

    a = angle * Math.PI / 180;
    // Convert to radians because that's what
                           // JavaScript likes

    // Subtract midpoints, so that midpoint is translated to origin
    // and add it in the end again
    xr = (x - xm) * cos(a) - (y - ym) * sin(a)   + xm;// * cos(a) - ym * sin(a);
    yr = (x - xm) * sin(a) + (y - ym) * cos(a)   + ym;// * cos(a) - xm * sin(a);
    return [xr, yr];
  }

  function send(e){
    // console.log(e);
    ws.send(JSON.stringify(e));
  }
}

function goFS(){
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  } else if (canvas.msRequestFullscreen) {
    canvas.msRequestFullscreen();
  } else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  }
}