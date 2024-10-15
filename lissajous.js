class Rectangle {
  constructor(x,y,w,h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  get center() {
    return {x: this.x + this.width / 2,
            y: this.y + this.height / 2};
  }

  get min_dimen() {
    if(this.width < this.height) {
      this.width;
    }

    return this.height;
  }
}

// class Pixel {
//   constructor(x,y) {
//     this.x = x;
//     this.y = y;
//   }
// }

class PixelStack {
  #store;
  #first_idx;
  
  constructor(length) {
    this.#store = new Array(length);
    this.#store.fill({x: 0, y: 0});
  }

  get length() {
    return this.#store.length;
  }

  push(pixel) {
    this.#store[this.#first_idx] = pixel;

    // adjust first index
    this.#first_idx += 1;
    this.#first_idx %= this.#store.length;
  }

  // idx range is [0,length-1]
  peak(idx) {
    const true_idx = (this.#first_idx + idx) % this.#store.length;
    return this.#store[true_idx];
  }

  [Symbol.iterator]() {
    let index = 0;
    let that = this;

    return {
      next() {
        if (index < that.length) {
          const val = that.peak(index);
          index += 1;
          
          return { value: val, done: false };
        } else {
          return { done: true };
        }
      }
    };
  }
}

class Phasor {
  constructor(amp, ang_freq, phase) {
    this.amplitude = amp
    this.frequency = ang_freq
    this.phase = phase
  }

  valueAt(t) {
    return this.amplitude * Math.cos(this.frequency*t + this.phase);
  }
}



const y_phasor = new Phasor(1, 20, 0);
const x_phasor = new Phasor(1, 20, 0);
const trail = new PixelStack(20);


const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

// top-left is origin
const display_bounds = new Rectangle(200,0, 200,200);
const x_bounds = new Rectangle(200,200, 200,100);
const y_bounds = new Rectangle(0,0, 200,200);

let t = 0;
let dt = 0.01;

//function animate() {
  t += dt;
  
  trail.push({
    x: x_phasor.valueAt(t),
    y: y_phasor.valueAt(t)
  });
  

  //////////////////
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // display rect
  ctx.fillStyle = "black";
  ctx.fillRect(display_bounds.x,
               display_bounds.y,
               display_bounds.width,
               display_bounds.height);

  // x phasors
  const x_center = x_bounds.center;

  ctx.beginPath();
  ctx.arc(x_center.x, x_center.y, x_bounds.min_dimen/2, 0, 2 * Math.PI);
  ctx.stroke();

  // y phasors
  const y_center = y_bounds.center;

  ctx.beginPath();
  ctx.arc(y_center.x, y_center.y, y_bounds.min_dimen/2, 0, 2 * Math.PI);
  ctx.stroke();

  // trail
  const trail_start = trail.peak(0);
  
  ctx.beginPath();
  ctx.strokeStyle = "green";
  ctx.moveTo(trail_start.x, trail_start.y);
  for(const px of trail) {
    ctx.lineTo(px.x, px.y);
  }
  ctx.stroke();
//}

//animate();
