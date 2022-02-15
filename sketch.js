// import Person from "./Person";
let boy;
let girl;
function preload() {
  img = loadImage("boy.png");
  result = loadStrings("./location/img2_68.txt");
  img2 = loadImage("girl.png");
  result2 = loadStrings("./location/img1_68.txt");
}
function setup() {
  createCanvas(700, 700);
  background(0);
  // 畫人（物件）
  boy = new Person({
    n: "boy",
    p: createVector(0, 0),
    img: img,
    points: result,
  });
  boy.setupInfo();
  boy.draw();
  // 畫人（物件）
  girl = new Person({
    n: "girl",
    p: createVector(180, 40),
    img: img2,
    points: result2,
  });
  girl.setupInfo();
  girl.draw();
}

function draw() {
  keyPressed();
  if (!boy.isTouched() && !girl.isTouched()) {
    // background(0);
    boy.setupCell();
    girl.setupCell();
  }
  // 如果cell被touched
  // 互相感測觸碰
  let boyCenterPositionX = boy.p.x + boy.centerPoint.x;
  let boyCenterPositionY = boy.p.y + boy.centerPoint.y;
  let girlCenterPositionX = girl.p.x + girl.centerPoint.x;
  let girlCenterPositionY = girl.p.y + girl.centerPoint.y;
  let dist_touch = dist(
    boyCenterPositionX,
    boyCenterPositionY,
    girlCenterPositionX,
    girlCenterPositionY
  );
  if (dist_touch < boy.r + girl.r) {
    print("碰到了");
    background(0, 0.01);
    girl.shaderChange(
      girl.collisionSensor,
      boy.collisionSensor,
      boy.p,
      boy.centerPoint
    );
    boy.shaderChange(
      boy.collisionSensor,
      girl.collisionSensor,
      girl.p,
      girl.centerPoint
    );
  }
}
function keyPressed() {
  if (keyIsDown(LEFT_ARROW)) {
    background(0);
    boy.update(createVector(-10, 0));
    boy.setupCell();
    girl.setupCell();
  }
  if (keyIsDown(RIGHT_ARROW)) {
    background(0);
    boy.update(createVector(10, 0));
    boy.setupCell();
    girl.setupCell();
  }
  if (keyIsDown(UP_ARROW)) {
    background(0);
    boy.update(createVector(0, -10));
    boy.setupCell();
    girl.setupCell();
  }
  if (keyIsDown(DOWN_ARROW)) {
    background(0);
    boy.update(createVector(0, 10));
    boy.setupCell();
    girl.setupCell();
  }
}

class Person {
  constructor(args) {
    this.name = args.n;
    this.p = args.p;
    this.v = args.v || createVector(1, -1);
    this.collisionSensor = createVector(0, 0);
    this.img = args.img;
    this.points = args.points;
    this.processedImg = args.img;
    this.r = 0;
    this.facePosList = [];
    this.particles = [];
    this.centerPoint = createVector(0, 0);
    this.w = 0;
    this.h = 0;
    this.circleMask = createGraphics(this.img.width, this.img.height);
  }
  setupInfo() {
    push();
    // 整理landmark
    for (let point = 0; point < 68; point++) {
      let regexParse = this.points[point]
        .match(/^\d+|\d+\b|\d+(?=\w)/g)
        .map(function (v) {
          return +v;
        });
      let x = regexParse[0];
      let y = regexParse[1];
      this.facePosList.push([x, y]);
    }

    // mask 圖片遮罩
    // circleMask = createGraphics(this.img.width ,this.img.height);
    this.centerPoint = {
      x: int(this.facePosList[33][0]),
      y: int(this.facePosList[33][1]),
    };
    this.w = int(int(this.facePosList[16][0]) - int(this.facePosList[0][0]));
    this.h = abs(
      int(int(this.facePosList[8][1]) - int(this.facePosList[19][1]))
    );
    this.r = this.w / 2;

    // 取出pixel
    for (
      let row = this.facePosList[0][0];
      row < this.facePosList[0][0] + this.w;
      row += 2
    ) {
      for (
        let col = this.facePosList[19][1];
        col < this.facePosList[8][1];
        col += 2
      ) {
        // 取樣
        let c = this.img.get(row, col);
        this.particles.push({
          x: row,
          y: col,
          clr: color(c),
        });
      }
    }

    pop();
  }
  draw() {
    // 裝上細胞外殼
    this.setupCell();
    // 切圖蓋mask
    this.cropImg();
  }

  cropImg() {
    push();
    // 以鼻子為中心畫mask
    // ellipseMode(RADIUS);
    // noStroke();
    // colorMode(HSB);
    // blendMode(SCREEN);
    // fill('#0A369D');
    // ellipse(this.p.x+this.centerPoint.x,this.p.y+this.centerPoint.y-20,(this.w/2)+5);
    pop();
    push();
    // 畫出的pixel
    noStroke();
    // translate(this.p.x,this.p.y);
    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      // 兩點之間距離小於半徑才畫出來
      let distForPixel = dist(
        this.p.x + p.x,
        this.p.y + p.y,
        this.p.x + this.centerPoint.x,
        this.p.y + this.centerPoint.y - 20
      );
      if (distForPixel < this.r) {
        fill(p.clr);
        rect(this.p.x + p.x, this.p.y + p.y, 1);
      }
    }
    pop();
  }
  setupCell() {
    push();
    // 以鼻子為中心畫mask
    ellipseMode(RADIUS);
    noStroke();
    // colorMode(HSB);
    // blendMode(SCREEN);
    fill("#0A369D");
    // ellipse(this.p.x+this.centerPoint.x,this.p.y+this.centerPoint.y-20,(this.w/2)+5);
    // mask 圖片遮罩
    ellipseMode(CENTER);
    let circleMask;
    circleMask = createGraphics(this.img.width, this.img.height);
    circleMask.ellipse(this.centerPoint.x, this.centerPoint.y - 20, this.w);
    this.img.mask(circleMask);
    // 畫圖
    // image(this.img, this.p.x, this.p.y, this.img.width,this.img.height);

    this.cropImg();
    pop();
  }
  update(args) {
    this.p.add(args);
    this.collisionSensor = { x: args.x, y: args.y };
    print(this.collisionSensor);
  }
  isTouched() {
    let d = dist(
      mouseX,
      mouseY,
      this.p.x + this.facePosList[33][0],
      this.p.y + this.facePosList[28][1]
    );
    if (d < this.r) {
      return true;
    } else {
      return false;
    }
  }
  shaderChange(argsMe, argsAnother, positionAnother, centerAnother) {
    // 粒子流動方向
    let particleFlow = createVector(0, 0);

    if (argsMe.x != 0 || argsMe.y != 0) {
      // 情況1 ： 如果本身有動，往自己的方向流動
      particleFlow = argsMe;
    } else {
      // 情況2 ： 如果本身沒動(0,0)，是對方撞上來，紀錄對方的速度方向，之後往反方向流動
      particleFlow = { x: -argsAnother.x, y: -argsAnother.y };
    }
    print(this.name);
    print(particleFlow);
    print(particleFlow.x);
    print(particleFlow.y);
    // print(particleFlow.y);
    noStroke();
    let x = int(this.facePosList[33][0]);
    let y = int(this.facePosList[33][1]);
    // 自己目前的中心位置
    let myCenterX = this.p.x + this.centerPoint.x;
    let myCenterY = this.p.y + this.centerPoint.y;
    // 對方的中心位置
    let anotherCenterX = positionAnother.x + centerAnother.x;
    let anotherCenterY = positionAnother.y + centerAnother.y;
    // this.p.x += random(-2,2) + particleFlow.x/100;
    // this.p.y += random(-2,2) + particleFlow.y/100;
    // 偵測兩物件有無重疊
    if (dist(myCenterX, myCenterY, anotherCenterX, anotherCenterY) > 5) {
      this.p.x += random(-1, 1) + particleFlow.x / 15;
      this.p.y += random(-1, 1) + particleFlow.y / 15;
      this.particleFlow(particleFlow);
    } else {
      print("重疊了");
      // this.particleFlow(particleFlow);
    }
  }
  particleFlow(particleFlow) {
    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      // this.p.x+p.x,this.p.y+p.y,this.p.x+this.centerPoint.x,this.p.y+this.centerPoint.y-20
      let distForPixel = dist(
        this.p.x + p.x,
        this.p.y + p.y,
        this.p.x + this.centerPoint.x,
        this.p.y + this.centerPoint.y - 20
      );
      if (distForPixel < this.r) {
        // 兩點之間距離小於半徑才畫出來
        fill(p.clr);
        ellipse(this.p.x + p.x, this.p.y + p.y, 1);
        // 變動個別粒子的方向（流動）
        // 可以留著的效果
        // p.x += (noise(p.x/200+particleFlow.x/10,p.y/200)-0.5)*5;
        // p.y += (noise(p.x/200,p.y+ particleFlow.y/10/200)-0.5)*5 ;
        p.x +=
          (noise(
            p.x / 200 + particleFlow.x / 10,
            p.y / 200 + particleFlow.y / 10
          ) -
            0.5) *
          2;
        p.y +=
          (noise(
            p.x / 200 + particleFlow.x / 10,
            p.y / 10 + particleFlow.y / 200
          ) -
            0.5) *
          2;
      }
    }
  }
}
