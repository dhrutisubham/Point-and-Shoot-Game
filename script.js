/**@type {HTMLCanvasElement} */

window.addEventListener('load', function(){
    const canvas=document.getElementById('canvas1');
const ctx=canvas.getContext('2d');
canvas.width=1024;
canvas.height=1024;

const collisionCanvas=document.getElementById('collisionDetection');
const collCtx=collisionCanvas.getContext('2d');
collisionCanvas.width=1024;
collisionCanvas.height=1024;

const scoreCard=document.getElementById('score');
const bullets=document.getElementById('bulletCount');



ctx.font='80px Staatliches';

let aim=new Image();
let posX=0;
let posY=0;
aim.src='Frame 1.svg';

let timetoNextRaven=0;
let ravenInterval=500;
let lastTime=0;
let gameFrame=0;

let points=0;
let bulletCount=3;

let startGame=0;

window.addEventListener('mousemove', (e)=>{
    let canvasPosition = canvas.getBoundingClientRect();

    let aw=canvasPosition.right-canvasPosition.left;
    let ah=canvasPosition.bottom-canvasPosition.top;


    if(e.clientX<canvasPosition.right && e.clientX>canvasPosition.left
        && e.clientY>canvasPosition.top && e.clientY<canvasPosition.bottom){
            canvas.style.cursor='none';
            collisionCanvas.style.cursor='none';
        }
    if(e.clientX<canvasPosition.left){
        posX=0;
    }
    else if(e.clientX>canvasPosition.right){
        posX=canvas.width;
    }else{
        posX=(e.clientX-canvasPosition.left)*canvas.width/aw;
    }
    if(e.clientY<canvasPosition.top){
        posY=0;
    }
    else if(e.clientY>canvasPosition.bottom){
        posY=canvas.height;
    }else{
        posY=(e.clientY-canvasPosition.top)*canvas.height/ah;
    }
});

let explosions=[];
class Explosion{
    constructor(x, y, sizeMod){
        this.spriteWidth=200;
        this.spriteHeight=179;
        this.width=this.spriteWidth*sizeMod;
        this.height=this.spriteHeight*sizeMod;

        this.x=x-this.width*0.25;
        this.y=y-this.height*0.25;

        this.image=new Image();
        this.image.src='boom.png';
        this.maxframe=5;

        this.frame=0;
        this.expTime=0;
        this.expTotal=200;

        this.markedForDeletion=false;

        this.sound=new Audio();
        this.sound.src='Coin01.wav';
        this.sound.play();
    }
    update(deltaTime){
        this.expTime+=deltaTime;
        if(this.expTime>=this.expTotal)
        {
            this.frame=(this.frame+1);
            this.expTime=0;
        }
        if(this.frame+1==this.maxframe){
            this.markedForDeletion=true;
        }

    }
    draw(){
        ctx.drawImage(this.image, this.frame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let ravens=[];
class Raven{
    constructor(){
        this.spriteWidth=271;
        this.spriteHeight=194;
        this.sizeMod=Math.random()*0.3+0.2;
        this.width=this.spriteWidth*this.sizeMod;
        this.height=this.spriteHeight*this.sizeMod;
        
        this.x=canvas.width;
        this.y=Math.random()*(canvas.height- this.height-150);
        this.directionX=Math.random()*5+3;
        this.directionY=Math.random()*5-2.5;
        this.markedForDeletion=false;
        this.shot=false;

        this.image=new Image();
        this.image.src='raven.png';
        this.maxframe=6;
        
        this.frame=0;
        this.animationSpeed=Math.floor(Math.random()*6+1);
        this.flapTime=0;
        this.flapInt=Math.random()*100+50;

        this.randomColors=[Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)];
        this.color='rgb('+this.randomColors[0]+','+this.randomColors[1]+','+this.randomColors[2] + ')';
        
    }

    update(deltaTime){
        this.x-=this.directionX;
        this.y-=((this.directionY));
        if(this.x+this.width<0 || this.y>=canvas.height)this.markedForDeletion=true;
        this.flapTime+=deltaTime;
        if(this.flapTime>=this.flapInt)
        {
            this.frame=(this.frame+1)%this.maxframe;
            this.flapTime=0;
        }
        if((this.y+this.height>canvas.height-150 || this.y<0) && !this.shot){
            this.directionY*=-1;
        }  
    }

    draw(){
        collCtx.fillStyle=this.color;
        collCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame*this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }   
}

function shootScore(ctx){
        ctx.save();
        ctx.textAlign='left';
        ctx.font='60px Staatliches';
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowColor='black';
        ctx.shadowBlur=25;
        ctx.fillStyle='white';
        ctx.fillText('Score: '+points, 50, 100);
        ctx.restore();
}

function bulletUpdate(ctx){
        ctx.save();
        ctx.textAlign='left';
        ctx.fillStyle='white';
        ctx.shadowOffsetX=0;
        ctx.shadowOffsetY=0;
        ctx.shadowColor='black';
        ctx.shadowBlur=20;
        ctx.font='40px Staatliches';
        ctx.fillText('Bullets: '+bulletCount, 50, 150);
        ctx.restore();
}

window.addEventListener('click',function(e){
    let gunSound=new Audio();
    gunSound.src='pistol2.wav';

    if(startGame){
    const pixelClickColor=collCtx.getImageData(posX, posY, 10, 10);
    const pc=pixelClickColor.data;
    if(bulletCount){
        gunSound.play();
    bulletCount=Math.max(0, bulletCount-1);
    console.log(bulletCount);
    
    

    ravens.forEach(object=>{
        if(object.randomColors[0]===pc[0] && object.randomColors[1]===pc[1] && object.randomColors[2]===pc[2] && !object.shot) {
        object.markedForDeletion=true;
        explosions.push(new Explosion(object.x, object.y, object.sizeMod+0.2));
        points++;
        object.shot='true';
        bulletCount++;

    }
    });
    }
    else{
        location.reload();
    }
    }
    else{
        gunSound.play();
        startGame=1;
    }
});

let bgimage=clouds;
let bgx=0;

function gameOver(){
    ctx.fillStyle='white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function animate(timestamp){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    collCtx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(aim, posX-104*0.3, posY-104*0.3, 208*0.3, 209*0.3);
    if(startGame)
    {
        ctx.drawImage(bgimage, bgx, 0, canvas.width, 1024, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgimage, bgx-3413, 0, canvas.width, 1024, 0, 0, canvas.width, canvas.height);
        bgx=(bgx+2)%3414;
        
        let deltaTime=timestamp-lastTime;
        lastTime= timestamp;
        timetoNextRaven+=deltaTime;

        if(timetoNextRaven>ravenInterval){
            ravens.push(new Raven());
            timetoNextRaven=0;
            ravens.sort(function(a, b){
                return a.width-b.width;
            })
        };
        [...ravens, ...explosions].forEach(object=>object.update(deltaTime));
        [...ravens, ...explosions].forEach(object=>object.draw());
        ravens=ravens.filter(object=>!object.markedForDeletion);

        
        explosions=explosions.filter(object2=>!object2.markedForDeletion);

        shootScore(ctx);
        bulletUpdate(ctx);
    }
    else{
        let loadimage=document.getElementById('bgimage');
        ctx.drawImage(loadimage, bgx, 0, canvas.width, 1024, 0, 0, canvas.width, canvas.height);

    }
    if(bulletCount){
    requestAnimationFrame(animate);
    }
    
}
animate(0);

function cursor(){
    if(bulletCount<=0){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle='white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle='#FF0000DD';
    ctx.textAlign='center';
    ctx.fillText('GAME OVER', canvas.width*0.5, canvas.height*0.5-40);
    ctx.fillStyle='#000000DD';
    ctx.fillText('Your score is: ' +points, canvas.width*0.5, canvas.height*0.5+40);
    }
    ctx.drawImage(aim, posX-104*0.3, posY-104*0.3, 208*0.3, 209*0.3);
    
    requestAnimationFrame(cursor);
}
cursor(0);
})