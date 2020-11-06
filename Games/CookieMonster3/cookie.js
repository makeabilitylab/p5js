class Cookie extends Circle {
  constructor() {
    let cookieDiameter = 30;
    let cookieRadius = cookieDiameter / 2;
    let cookieX = random(cookieRadius, width - cookieRadius);
    let cookieY = random(cookieRadius, height - cookieRadius);
    super(cookieX, cookieY, cookieDiameter, color(255));

    this.imgCookie = loadImage('assets/cookie_300x300.png');
  }

  relocate() {
    let radius = this.width / 2;
    this.x = random(radius, width - radius);
    this.y = random(radius, height - radius);
  }

  draw() {
    push();
    imageMode(CENTER);
    image(this.imgCookie, this.x, this.y, this.width, this.height);

    if (drawDebugInfo) {
      noFill();
      stroke(255, 0, 0);
      ellipse(this.x, this.y, this.width, this.height);
    }
    pop();
  }
}