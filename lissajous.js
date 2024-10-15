class Rectangle {
  constructor(x=0,y=0,w=0,h=0) {
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

  get left() {
    return this.x;
  }
  
  get right() {
    return this.x + this.width;
  }
  
  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.height;
  }
  
}

class PixelStack {
  #store;
  #first_idx = 0;
  
  constructor(length, fill = {x: 0, y: 0}) {
    this.#store = new Array(length);
    this.#store.fill(fill);
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

  phaseAt(t) {
    return this.frequency*t + this.phase;
  }
}



function drawPhasorCircle(ctx, center, radius, phase) {
  // circumference
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'black'; 
  ctx.stroke();

  // grid vertical
  ctx.beginPath();
  ctx.moveTo(center.x, center.y-radius);
  ctx.lineTo(center.x, center.y+radius);
  ctx.strokeStyle = 'black';
  ctx.setLineDash([5,3]);
  ctx.stroke();

  ctx.setLineDash([]); // reset state

  // grid horizontal
  ctx.beginPath();
  ctx.moveTo(center.x-radius, center.y);
  ctx.lineTo(center.x+radius, center.y);
  ctx.strokeStyle = 'black';
  ctx.setLineDash([5,3]);
  ctx.stroke();

  ctx.setLineDash([]); // reset state

  // vector
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(center.x + radius * Math.cos(phase),
             center.y + radius * Math.sin(phase));
  ctx.strokeStyle = 'black';
  ctx.stroke();

  // x component
  ctx.beginPath();
  ctx.moveTo(center.x + radius * Math.cos(phase),
             center.y + radius * Math.sin(phase));
  ctx.lineTo(center.x,
            center.y + radius * Math.sin(phase));
  ctx.strokeStyle = 'blue';
  ctx.stroke();

  // y component
  ctx.beginPath();
  ctx.moveTo(center.x + radius * Math.cos(phase),
             center.y + radius * Math.sin(phase));
  ctx.lineTo(center.x + radius * Math.cos(phase),
             center.y);
  ctx.strokeStyle = 'red';
  ctx.stroke();

}



//
// Drawing Init
//
const y_phasor = new Phasor(200, Math.PI / 5, 0);
const x_phasor = new Phasor(200, Math.PI / 5, 0);
const y_bounds = new Rectangle();
const x_bounds = new Rectangle();
const display_bounds = new Rectangle();
const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d');

function refreshCanvasBounds() {
  y_bounds.x = 0;
  y_bounds.y = 0;
  y_bounds.width = 2 * y_phasor.amplitude;
  y_bounds.height = 2 * y_phasor.amplitude;

  x_bounds.x = y_bounds.right;
  x_bounds.y = y_bounds.bottom;
  x_bounds.width = 2 * x_phasor.amplitude;
  x_bounds.height = 2 * x_phasor.amplitude;

  display_bounds.x = y_bounds.right;
  display_bounds.y = y_bounds.top;
  display_bounds.width = x_bounds.width;
  display_bounds.height = y_bounds.height;

  canvas.height = display_bounds.height + x_bounds.height;
  canvas.width = display_bounds.width + y_bounds.width;
}


//
// Event Listeners
//
const y_amp_input = document.getElementById('v-amp-input');
const y_freq_input = document.getElementById('v-freq-input');
const y_phase_input = document.getElementById('v-phase-input');

const x_amp_input = document.getElementById('h-amp-input');
const x_freq_input = document.getElementById('h-freq-input');
const x_phase_input = document.getElementById('h-phase-input');

function on_change_fcn() {
  function amp_val_to_number(str) {
    const val = Number(str.replace(/\D/g, ""));
    if(!isNaN(val)) {
      return val;
    }
    
    return 1;
  };

  function freq_val_to_number(str) {
    const val = Number(str.replace(/\D/g, ""));
    if(!isNaN(val)) {
      return val;
    }
    
    return 1;
  };

  function phase_val_to_number(str) {
    switch(str) {
    case 'phase0': return 0;
    case 'phase14': return Math.PI / 4;
    case 'phase13': return Math.PI / 3;
    case 'phase12': return Math.PI / 2;
    case 'phase23': return 2*Math.PI / 3;
    case 'phase34': return 3*Math.PI / 4;
    case 'phase1': return Math.PI;
    }

    return 0;
  }

  const freq_scale = Math.PI
  const amp_scale = 100;
  y_phasor.amplitude = amp_val_to_number(y_amp_input.value) * amp_scale;
  y_phasor.frequency = freq_val_to_number(y_freq_input.value) * freq_scale;
  y_phasor.phase = phase_val_to_number(y_phase_input.value);

  x_phasor.amplitude = amp_val_to_number(x_amp_input.value) * amp_scale;
  x_phasor.frequency = freq_val_to_number(x_freq_input.value) * freq_scale;
  x_phasor.phase = phase_val_to_number(x_phase_input.value);

  refreshCanvasBounds();
};

y_amp_input.addEventListener('change', on_change_fcn);
y_freq_input.addEventListener('change', on_change_fcn);
y_phase_input.addEventListener('change', on_change_fcn);

x_amp_input.addEventListener('change', on_change_fcn);
x_freq_input.addEventListener('change', on_change_fcn);
x_phase_input.addEventListener('change', on_change_fcn);

on_change_fcn();

//
// Animation
//
refreshCanvasBounds();
const trail = new PixelStack(300, display_bounds.center);
let t = 0;
let dt = 0.01;
function animate() {
  t += dt;
  
  trail.push({
    x: x_phasor.valueAt(t) + display_bounds.center.x,
    y: -y_phasor.valueAt(t) + display_bounds.center.y
  });
  

  //////////////////
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // display rect
  ctx.fillStyle = "black";
  ctx.fillRect(display_bounds.x,
               display_bounds.y,
               display_bounds.width,
               display_bounds.height);

  // phasors
  drawPhasorCircle(ctx,
                   x_bounds.center,
                   x_bounds.min_dimen/2,
                   x_phasor.phaseAt(t)
                  )

  drawPhasorCircle(ctx,
                   y_bounds.center,
                   y_bounds.min_dimen/2,
                   y_phasor.phaseAt(t) - Math.PI/2
                  )

  // trail
  const trail_start = trail.peak(0);
  
  ctx.beginPath();
  ctx.moveTo(trail_start.x, trail_start.y);
  for(const px of trail) {
    ctx.lineTo(px.x, px.y);
  }
  ctx.strokeStyle = "green";
  ctx.stroke();

  // Request the next animation frame
  requestAnimationFrame(animate);
}

animate();
