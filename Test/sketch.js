let val1 = 1;
let val2 = 1;

function setup() {
  createCanvas(400, 400);
  print(cur_val);
  print(sum);
}

function draw() {
  background(220);
  
  sum = val1 + val2;
  val2 = sum;
  
  print(sum);
  cur_val = sum;

  if(sum > 10000){
    noLoop();
  }
}
