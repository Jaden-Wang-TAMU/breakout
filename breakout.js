//Level 1=normal, Level 2=Smaller bricks, Level 3=Smaller pads, Level 4= smaller ball, Level 5= invisible paddle
var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var brickWidth=48;
var brickHeight=13;
var canTeleport=0;
var canMovePaddle=false;
var notifications=true;
var level=1;

window.onload = function() {
    document.body.appendChild(canvas);
    animate(step);
};

var step = function() {
    update();
    render();
    animate(step);
};

var update = function() {
    ball.update(player.paddle);
    bricks.update(player);
    for (const newBall of ball2s) {
      newBall.update(player.paddle)
    }
};

function Paddle(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.x_speed = 0;
    this.y_speed = 0;    
    this.lives=10;
    this.points=0;
    this.shrunk=false;
    this.visible=true;
  }

Paddle.prototype.render = function() {  
  context.fillStyle = "#0000FF";
  
  if(this.visible){
    context.fillRect(this.x, this.y, this.width, this.height);
  }

  context.font = '20px serif';
  if(level==1){
    context.fillText("Score: "+this.points+",  Lives: "+this.lives+",  Level: "+level+", Standard", 20, 20)
  }
  else if(level==2){
    context.fillText("Score: "+this.points+",  Lives: "+this.lives+",  Level: "+level+", Small Bricks", 20, 20)
  }
  else if(level==3){
    context.fillText("Score: "+this.points+",  Lives: "+this.lives+",  Level: "+level+", Small Pad", 20, 20)
  }
  else if(level==4){
    context.fillText("Score: "+this.points+",  Lives: "+this.lives+",  Level: "+level+", Small Ball", 20, 20)
  }
  else{
    context.fillText("Score: "+this.points+",  Lives: "+this.lives+",  Level: "+level+", Invisible Pad", 20, 20)
  }
};

Paddle.prototype.move = function(x, y) {
    this.x += x;
    this.y += y;
    this.x_speed = x;
    this.y_speed = y;
    if(this.x < 0) { // all the way to the left
      this.x = 0;
      this.x_speed = 0;
    } else if (this.x + this.width > 400) { // all the way to the right
      this.x = 400 - this.width;
      this.x_speed = 0;
    }
}

function Player() {
    this.paddle = new Paddle(175, 580, 50, 20);
}

Player.prototype.render = function() {
    this.paddle.render();
};

Player.prototype.updateMouse = function(x, y) {
  if(this.paddle.x < 0) { // all the way to the left
    this.paddle.x = 0;
    this.paddle.x_speed = 0;
  } else if (this.paddle.x + this.paddle.width > 400) { // all the way to the right
    this.paddle.x = 400 - this.paddle.width;
    this.paddle.x_speed = 0;
  }

  if(this.paddle.x>x)
    this.paddle.x_speed=-4
  else if(this.paddle.x<x)
    this.paddle.x_speed=4
  
  if(this.paddle.shrunk)
    this.paddle.x=x-25
  else
    this.paddle.x=x-45;
  
  if(canMovePaddle)
    this.paddle.y=y;
  else
    this.paddle.y=580
};

function Ball(x, y) {
    this.x = x;
    this.y = y;
    this.x_speed = 0;
    this.y_speed = 3;
    this.radius = 5;
  }

Ball.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#000000";
    context.fill();
};

Ball.prototype.update = function(paddle1) {
    this.x += this.x_speed;
    this.y += this.y_speed;
    var top_x = this.x - 5;
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    if(this.x - 5 < 0) { // hitting the left wall
      this.x = 5;
      this.x_speed = -this.x_speed;
    } else if(this.x + 5 > 400) { // hitting the right wall
      this.x = 395;
      this.x_speed = -this.x_speed;
    }
    else if(this.y - 5 < 0){ // hitting the top wall
      this.y=this.y+10
      this.y_speed=-this.y_speed;
    }

    if(this.y + 5 > 600) { // a life was taken
      this.y_speed = 3;
      this.x_speed = 0;
      this.x = 200;
      this.y = 300;
      paddle1.lives-=1;
      canMovePaddle=false;
      if(paddle1.lives<=0)
        window.location.href="lose.html"
    }

    if(top_y > 300) {
      if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
        // hit the player's paddle
        this.y_speed = -3;
        this.x_speed += (paddle1.x_speed / 2);
        if(this.x_speed>10){
            this.x_speed=5;
            console.log("nerfed speed")
        }
        this.y += this.y_speed;
        console.log("hit paddle")
      }
    }
    for(let y=0; y<8; y++){
      let checkList=bricks.list[y];
      for(let x=0; x<8; x++){
        let checkBrick=checkList[x];
        if(checkBrick.visible && checkBrick.x+brickWidth>=this.x-5 && checkBrick.x<=this.x+5 && checkBrick.y+brickHeight>=this.y-5 && checkBrick.y<=this.y+5){
          checkBrick.visible=false
          this.y_speed=-this.y_speed
          if(checkBrick.color=="y")
            paddle1.points+=1;
          if(checkBrick.color=="g")
            paddle1.points+=3;
          if(checkBrick.color=="o")
          {
            paddle1.points+=5;
          }
          if(checkBrick.color=="r"){
            paddle1.points+=7;
          }

          if(checkBrick.boom){
            console.log("boom")
            if(notifications)
              alert("Kaboom! You hit an explosive brick!")
            checkList[x-1].visible=false
            let tempBrick=checkList[x-1];
            if(tempBrick.color=="y")
              paddle1.points+=1;
            else if(tempBrick.color=="g")
              paddle1.points+=3;
            else if(tempBrick.color=="o")
              paddle1.points+=5;
            else if(tempBrick.color=="r")
              paddle1.points+=7;

            checkList[x+1].visible=false
            tempBrick=checkList[x+1];
            if(tempBrick.color=="y")
              paddle1.points+=1;
            else if(tempBrick.color=="g")
              paddle1.points+=3;
            else if(tempBrick.color=="o")
              paddle1.points+=5;
            else if(tempBrick.color=="r")
              paddle1.points+=7;
            
            bricks.list[y-1][x].visible=false
            bricks.list[y+1][x].visible=false
          }

          if(checkBrick.teleporter){
            console.log("teleported")
            ball.x=Math.floor(Math.random()*380+1)
            ball.y=Math.floor(Math.random()*500+1)
            if(notifications)
              alert("You hit a teleporter brick! The black ball will now be teleported to "+ball.x+", "+ball.y)
          }
          console.log("hit a brick")
          break;
        }
      }
    }

    if(teleBrick.visible && teleBrick.x+20>=this.x-ball.radius && teleBrick.x<=this.x+ball.radius && teleBrick.y+10>=this.y-ball.radius && teleBrick.y<=this.y+ball.radius){
      teleBrick.visible=false;
      if(notifications)
        alert("You got the Teleport powerup! Up to 3 times, you can teleport the black ball to a random point on the screen by left-clicking with the mouse!")
      canTeleport+=3;
    }

    if(moveBrick.visible && moveBrick.x+20>=this.x-ball.radius && moveBrick.x<=this.x+ball.radius && moveBrick.y+10>=this.y-ball.radius && moveBrick.y<=this.y+ball.radius){
      moveBrick.visible=false;
      if(notifications)
        alert("You got the Moveable-Paddle powerup! You can now move the paddle up and down with your mouse! When you lose a life, your paddle will be moved back to the bottom.")
      canMovePaddle=true;
    }

    if(ballBrick.visible && ballBrick.x+20>=this.x-ball.radius && ballBrick.x<=this.x+ball.radius && ballBrick.y+10>=this.y-ball.radius && ballBrick.y<=this.y+ball.radius){
      ballBrick.visible=false;
      if(notifications)
        alert("You spawned another ball! Don't worry; this one won't make you lose lives!")
      let ball2 = new Ball2(200, 300);
      ball2s.push(ball2)
    }
};

function Ball2(x, y) {
  this.x = x;
  this.y = y;
  this.x_speed = 0;
  this.y_speed = 3;
  this.radius = 5;
  this.visible=true
}

Ball2.prototype.render = function() {
  if(this.visible){
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#FFFFFF";
    context.fill();
  }
};

Ball2.prototype.update = function(paddle1) {
  this.x += this.x_speed;
  this.y += this.y_speed;
  var top_x = this.x - 5;
  var top_y = this.y - 5;
  var bottom_x = this.x + 5;
  var bottom_y = this.y + 5;

  if(this.x - 5 < 0) { // hitting the left wall
    this.x = 5;
    this.x_speed = -this.x_speed;
  } else if(this.x + 5 > 400) { // hitting the right wall
    this.x = 395;
    this.x_speed = -this.x_speed;
  }
  else if(this.y - 5 < 0){ // hitting the top wall
    this.y=this.y+10
    this.y_speed=-this.y_speed;
  }

  if(this.y + 5 > 600) { 
    this.visible=false;
  }

  if(top_y > 300) {
    if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) {
      // hit the player's paddle
      this.y_speed = -3;
      this.x_speed += (paddle1.x_speed / 2);
      if(this.x_speed>10){
          this.x_speed=5;
          console.log("nerfed speed")
      }
      this.y += this.y_speed;
      console.log("hit paddle")
    }
  }
  for(let y=0; y<8; y++){
    let checkList=bricks.list[y];
    for(let x=0; x<8; x++){
      let checkBrick=checkList[x];
      if(checkBrick.visible && checkBrick.x+brickWidth>=this.x-5 && checkBrick.x<=this.x+5 && checkBrick.y+brickHeight>=this.y-5 && checkBrick.y<=this.y+5){
        checkBrick.visible=false
        this.y_speed=-this.y_speed
        if(checkBrick.color=="y")
          paddle1.points+=1;
        if(checkBrick.color=="g")
          paddle1.points+=3;
        if(checkBrick.color=="o")
        {
          paddle1.points+=5;
        }
        if(checkBrick.color=="r"){
          paddle1.points+=7;
        }
        if(checkBrick.boom){
          console.log("boom")
          if(notifications)
            alert("Kaboom! You hit an explosive brick!")
          checkList[x-1].visible=false
          let tempBrick=checkList[x-1];
          if(tempBrick.color=="y")
            paddle1.points+=1;
          else if(tempBrick.color=="g")
            paddle1.points+=3;
          else if(tempBrick.color=="o")
            paddle1.points+=5;
          else if(tempBrick.color=="r")
            paddle1.points+=7;

          checkList[x+1].visible=false
          tempBrick=checkList[x+1];
          if(tempBrick.color=="y")
            paddle1.points+=1;
          else if(tempBrick.color=="g")
            paddle1.points+=3;
          else if(tempBrick.color=="o")
            paddle1.points+=5;
          else if(tempBrick.color=="r")
            paddle1.points+=7;
          
          bricks.list[y-1][x].visible=false
          bricks.list[y+1][x].visible=false
        }
        console.log("hit a brick")
        break;
      }
    }
  }

  if(teleBrick.visible && teleBrick.x+20>=this.x-ball.radius && teleBrick.x<=this.x+ball.radius && teleBrick.y+10>=this.y-ball.radius && teleBrick.y<=this.y+ball.radius){
    teleBrick.visible=false;
    if(notifications)
      alert("You got the Teleport powerup! Up to 3 times, you can teleport the black ball to a random point on the screen by left-clicking with the mouse!")
    canTeleport+=3;
  }

  if(moveBrick.visible && moveBrick.x+20>=this.x-ball.radius && moveBrick.x<=this.x+ball.radius && moveBrick.y+10>=this.y-ball.radius && moveBrick.y<=this.y+ball.radius){
    moveBrick.visible=false;
    if(notifications)
      alert("You got the Moveable-Paddle powerup! You can now move the paddle up and down with your mouse! When you lose a life, your paddle will move back to the bottom.")
    canMovePaddle=true;
  }

  if(ballBrick.visible && ballBrick.x+20>=this.x-ball.radius && ballBrick.x<=this.x+ball.radius && ballBrick.y+10>=this.y-ball.radius && ballBrick.y<=this.y+ball.radius){
    ballBrick.visible=false;
    if(notifications)
      alert("You spawned another ball! Don't worry; this one won't make you lose lives!")
    let ball2 = new Ball2(200, 300);
    ball2s.push(ball2)
  }
};

function Brick(x, y, w, h, c){
  this.x=x;
  this.y=y;
  this.width=w;
  this.height=h;
  this.color=c;
  this.visible=true;
  this.boom=false;
  this.teleport=false;
  this.movePaddle=false;
  this.ball2=false;
  this.teleporter=false;
}

Brick.prototype.render = function() {
  if(this.visible){
    if(this.color=="y")
      context.fillStyle="#FFFF00"
    if(this.color=="g")
      context.fillStyle="#008000"
    if(this.color=="o")
      context.fillStyle="#FFA500"
    if(this.color=="r")
      context.fillStyle="#FF0000"
    if(this.color=="t")
      context.fillStyle="#008080"
    if(this.color=="m")
      context.fillStyle="#800000"
    if(this.color=="b")
      context.fillStyle="#0000FF"
    context.fillRect(this.x, this.y, this.width, this.height);
  }
};

function Bricks(){
  this.list=[]
  this.clearedLevel=false
  // this.clearedLevel=true;
  this.canClear2=false
  // this.canClear2=true;
  this.canClear3=false;
  // this.canClear3=true;
  this.canClear4=false;
  // this.canClear4=true;
  this.canClear5=false;
}

Bricks.prototype.update = function(){
  this.render()
  this.checkClearedLevel(player.paddle)
}

Bricks.prototype.render = function(){
  this.clearedLevel=true
  for(let y=0; y<8; y++){
    let checkList=this.list[y]
    for(let x=0; x<8; x++){
      let checkBrick=checkList[x]
      if (checkBrick.visible){
        checkBrick.render();
        this.clearedLevel=false
      }
    }
  }
}

Bricks.prototype.checkClearedLevel = function(paddle1){
  if(this.clearedLevel){
    brickWidth=18;
    brickHeight=8;
    this.list=[]
    for(let y=0; y<8; y++){
      let tempBricks=[];
      for(let x=0;x<8; x++){
        let color="";
        if(y<2)
          color="r";
        else if(y<4)
          color="o";
        else if(y<6)
          color="g";
        else
          color="y";
        let brick=new Brick(x*50+1, y*15+31, brickWidth, brickHeight,color);
        tempBricks.push(brick);
      }
      bricks.list.push(tempBricks);
    }
    rand1stInt=Math.floor(Math.random()*6+1);
    rand2ndInt=Math.floor(Math.random()*6+1);
    bricks.list[rand1stInt][rand2ndInt].boom=true;
    console.log("boom: "+rand1stInt+", "+rand2ndInt)
    rand1stInt2=Math.floor(Math.random()*6+1);
    rand2ndInt2=Math.floor(Math.random()*6+1);
    while(rand1stInt==rand1stInt2 && rand2ndInt==rand2ndInt2){
      rand1stInt2=Math.floor(Math.random()*6+1);
      rand2ndInt2=Math.floor(Math.random()*6+1);
    }
    bricks.list[rand1stInt2][rand2ndInt2].boom=true;
    console.log("2nd boom: "+rand1stInt2+", "+rand2ndInt2)
    bricks.render()

    teleX=Math.floor(Math.random()*300+10)
    teleY=Math.floor(Math.random()*200+200)
    teleBrick=new Brick(teleX, teleY, 20, 10, "p")
    teleBrick.teleport=true;
    console.log("teleX: "+teleX+", teleY: "+teleY)

    moveX=Math.floor(Math.random()*300+10)
    moveY=Math.floor(Math.random()*200+200)
    moveBrick=new Brick(moveX, moveY, 20, 10, "m")
    moveBrick.movePaddle=true;
    console.log("moveX: "+moveX+", moveY: "+moveY)

    ballX=Math.floor(Math.random()*300+10)
    ballY=Math.floor(Math.random()*200+200)
    ballBrick=new Brick(ballX, ballY, 20, 10, "b")
    ballBrick.ball2=true;
    console.log("ballX: "+ballX+", ballY: "+ballY)


    if(this.canClear5){//If we can clear level 5 and we just cleared a level, we win
        window.location.href="win.html"
    }

    if(this.canClear4){//If we can clear level 5 and we just cleared a level, we cleared level 5
        paddle1.visible=false;
        this.canClear5=true;
    }

    if(this.canClear3){//If we can clear level 4 and we just cleared a level, we cleared level 4
        ball.radius=3;
        this.canClear4=true;// We can now try to clear level 5
    }

    if(this.canClear2){//If we can clear level 3 and we just cleared a level, we cleared level 3
      paddle1.width=25;
      paddle1.shrunk=true;
      this.canClear3=true; // We can now try to clear level 4
    }    
    this.clearedLevel=false
    this.canClear2=true //If we clear the level again, that means that we have cleared level 2, and we now can clear level 3
    ball.y_speed = 3;
    ball.x_speed = 0;
    ball.x = 200;
    ball.y = 300;
    for(const newBall of ball2s)
    {
      newBall.y_speed = 3;
      newBall.x_speed = 0;
      newBall.x = 200;
      newBall.y = 300;
    }
    level+=1
  }
}

var player = new Player();
var ball = new Ball(200, 300);
var bricks= new Bricks()
var ball2s=[]

for(let y=0; y<8; y++){
  let tempBricks=[];
  for(let x=0; x<8; x++){
    let color="";
    if(y<2)
      color="r";
    else if(y<4)
      color="o";
    else if(y<6)
      color="g";
    else
      color="y";
    let brick=new Brick(x*50+1, y*15+31, 48, 13, color);
    tempBricks.push(brick);
  }
  bricks.list.push(tempBricks);
}

let rand1stInt=Math.floor(Math.random()*6+1);
let rand2ndInt=Math.floor(Math.random()*6+1);
bricks.list[rand1stInt][rand2ndInt].boom=true;
console.log("boom: "+rand1stInt+", "+rand2ndInt)
let rand1stInt2=Math.floor(Math.random()*6+1);
let rand2ndInt2=Math.floor(Math.random()*6+1);
while(rand1stInt==rand1stInt2 && rand2ndInt==rand2ndInt2){
  rand1stInt2=Math.floor(Math.random()*6+1);
  rand2ndInt2=Math.floor(Math.random()*6+1);
}
bricks.list[rand1stInt2][rand2ndInt2].boom=true;
console.log("2nd boom: "+rand1stInt2+", "+rand2ndInt2)

let rand1stInt3=Math.floor(Math.random()*6+1);
let rand2ndInt3=Math.floor(Math.random()*6+1);
while(rand1stInt==rand1stInt3 || rand1stInt2==rand1stInt3 && rand2ndInt==rand2ndInt3 || rand2ndInt2==rand2ndInt3){
  rand1stInt3=Math.floor(Math.random()*6+1);
  rand2ndInt3=Math.floor(Math.random()*6+1);
}
bricks.list[rand1stInt3][rand2ndInt3].teleporter=true;
console.log("1st teleporter: "+rand1stInt3+", "+rand2ndInt3)

let rand1stInt4=Math.floor(Math.random()*6+1);
let rand2ndInt4=Math.floor(Math.random()*6+1);
while(rand1stInt==rand1stInt4 || rand1stInt2==rand1stInt4 && rand2ndInt==rand2ndInt4 || rand2ndInt2==rand2ndInt4 && rand1stInt3==rand2ndInt4 || rand2ndInt3==rand2ndInt4){
  rand1stInt4=Math.floor(Math.random()*6+1);
  rand2ndInt4=Math.floor(Math.random()*6+1);
}
bricks.list[rand1stInt4][rand2ndInt4].teleporter=true;
console.log("2nd teleporter: "+rand1stInt4+", "+rand2ndInt4)

bricks.render()

let teleX=Math.floor(Math.random()*300+10)
let teleY=Math.floor(Math.random()*200+200)
let teleBrick=new Brick(teleX, teleY, 20, 10, "t")
teleBrick.teleport=true;
console.log("teleX: "+teleX+", teleY: "+teleY)

let moveX=Math.floor(Math.random()*300+10)
let moveY=Math.floor(Math.random()*200+200)
let moveBrick=new Brick(moveX, moveY, 20, 10, "m")
moveBrick.movePaddle=true;
console.log("moveX: "+moveX+", moveY: "+moveY)

let ballX=Math.floor(Math.random()*300+10)
let ballY=Math.floor(Math.random()*200+200)
let ballBrick=new Brick(ballX, ballY, 20, 10, "b")
ballBrick.ball2=true;
console.log("ballX: "+ballX+", ballY: "+ballY)

player.paddle.clearedLevel=true
bricks.checkClearedLevel(player.paddle)

var render = function() {
  context.fillStyle = "#FF00FF";
  context.fillRect(0, 0, width, height);
  player.render();
  ball.render();
  bricks.render();
  teleBrick.render()
  moveBrick.render()
  ballBrick.render()
  for (const newBall of ball2s) {
    newBall.render(player.paddle)
  }
};

var keysDown = {};

window.addEventListener("keydown", function(event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
  delete keysDown[event.keyCode];
});

window.addEventListener("mousemove", function(event) {
    let mousex = event.clientX;
    let mousey = event.clientY;
    player.updateMouse(mousex, mousey, bricks)
  });

  document.addEventListener("click", myFunction);

  function myFunction() {
    if(canTeleport>0){
      ball.x=Math.floor(Math.random()*380+1)
      ball.y=Math.floor(Math.random()*500+1)
      if(notifications)
        alert("You teleported to "+ball.x+", "+ball.y)
      canTeleport-=1;
    }
  }

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if(notifications){
      alert('Turned off Alerts');
      notifications=false;
    }
    else{
      alert('Turned on Alerts');
      notifications=true;
    }
  }, false);
