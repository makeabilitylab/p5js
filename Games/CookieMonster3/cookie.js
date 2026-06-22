// The cookie to be eaten: a Circle drawn as a cookie image, placed at a random
// in-bounds spot and re-placed each time it's eaten.
class Cookie extends Circle {
  constructor() {
    let cookieDiameter = 30;
    let cookieRadius = cookieDiameter / 2;
    let cookieX = random(cookieRadius, width - cookieRadius);
    let cookieY = random(cookieRadius, height - cookieRadius);
    super(cookieX, cookieY, cookieDiameter, color(255));

    this.imgCookie = loadImage('assets/cookie_300x300.png');
  }

  // Move the cookie to a new random position that stays fully on screen.
  relocate() {
    let radius = this.width / 2;
    this.x = random(radius, width - radius);
    this.y = random(radius, height - radius);
  }

  // Draw the cookie image centered on its (x, y).
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