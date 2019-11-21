//definning variables
let width = window.innerWidth * (2 / 5);
let height = window.innerHeight * (3 / 5);
Konva.angleDeg = false;
let angularVelocity = 6;
let angularVelocities = [];
let lastRotation = 0;
let controlled = false;
let numWedges = 25;
let angularFriction = 0.2;
let target, activeWedge, stage, layer, wheel, pointer;
let finished = false;
let selectedText = {};
onChange = event => {
  text = event.options[event.selectedIndex].text;
  selectedText.value = text;
  console.log("selected text outside", selectedText.value);
};
function getAverageAngularVelocity() {
  let total = 0;
  let len = angularVelocities.length;
  console.log("checking len", len);
  if (len === 0) {
    return 0;
  }
  for (let n = 0; n < len; n++) {
    total += angularVelocities[n];
  }
  return total / len;
}
function purifyColor(color) {
  let randIndex = Math.round(Math.random() * 3);
  color[randIndex] = 0;
  return color;
}
function getRandomColor() {
  let r = 100 + Math.round(Math.random() * 55);
  let g = 100 + Math.round(Math.random() * 55);
  let b = 100 + Math.round(Math.random() * 55);
  return purifyColor([r, g, b]);
}
function getRandomReward() {
  let mainDigit = Math.round(Math.random() * 15);
  return mainDigit;
}
function addWedge(n) {
  let s = getRandomColor();
  let reward = getRandomReward();
  let r = s[0];
  let g = s[1];
  let b = s[2];
  let angle = (2 * Math.PI) / numWedges;
  let endColor = "rgb(" + r + "," + g + "," + b + ")";
  r += 100;
  g += 100;
  b += 100;
  var startColor = "rgb(" + r + "," + g + "," + b + ")";
  let wedge = new Konva.Group({
    rotation: (2 * n * Math.PI) / numWedges
  });
  let wedgeBackground = new Konva.Wedge({
    radius: 400,
    angle: angle,
    fillRadialGradientStartPoint: 0,
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndPoint: 0,
    fillRadialGradientEndRadius: 400,
    fillRadialGradientColorStops: [0, startColor, 1, endColor],
    fill: "#64e9f8",
    fillPriority: "radial-gradient",
    stroke: "#ccc",
    strokeWidth: 2
  });
  wedge.add(wedgeBackground);
  //adding the text in the arcs
  let text = new Konva.Text({
    text: reward,
    fontFamily: "Calibri",
    fontSize: 50,
    fill: "white",
    align: "center",
    stroke: "yellow",
    strokeWidth: 1,
    rotation: (Math.PI + angle) / 2,
    x: 380,
    y: 30,
    listening: false
  });
  wedge.add(text);
  text.cache();
  wheel.add(wedge);
}
function animate(frame) {
  // handle wheel spin
  let angularVelocityChange =
    (angularVelocity * frame.timeDiff * (1 - angularFriction)) / 1000;
  angularVelocity -= angularVelocityChange;
  // activate / deactivate wedges based on point intersection
  let shape = stage.getIntersection({
    x: stage.width() / 2,
    y: 100
  });
  if (controlled) {
    if (angularVelocities.length > 10) {
      angularVelocities.shift();
    }
    angularVelocities.push(
      ((wheel.rotation() - lastRotation) * 1000) / frame.timeDiff
    );
  } else {
    let diff = (frame.timeDiff * angularVelocity) / 1000;
    if (diff > 0.0001) {
      wheel.rotate(diff);
    } else if (!finished && !controlled) {
      if (shape) {
        let text = shape
          .getParent()
          .findOne("Text")
          .text();
        let price = text.split("\n").join("");
        if (selectedText.value === "Odd" && parseInt(price) % 2 !== 0) {
          console.log("selected text inside odd", selectedText.value);
          let betValue = document.getElementById("betValue").value;
          document.getElementById("amountWon").innerHTML =
            "You won $" + parseInt(betValue) * 2;
          //alert("Winning Price is $" + parseInt(price) * parseInt(betValue));
        } else if (selectedText.value === "Even" && parseInt(price) % 2 === 0) {
          let betValue = document.getElementById("betValue").value;
          document.getElementById("amountWon").innerHTML =
            "You won $" + parseInt(betValue) * 2;
          //alert("Winning Price is $" + parseInt(price) * parseInt(betValue));
        } else {
          document.getElementById("amountWon").innerHTML =
            "!!! Sorry you lost !!!";
        }
      }
      finished = true;
      setTimeout(function() {
        window.location.reload(true);
      }, 5000);
    }
  }
  lastRotation = wheel.rotation();
  if (shape) {
    if (shape && (!activeWedge || shape._id !== activeWedge._id)) {
      pointer.y(20);
      new Konva.Tween({
        node: pointer,
        duration: 0.3,
        y: 30,
        easing: Konva.Easings.ElasticEaseOut
      }).play();
      if (activeWedge) {
        activeWedge.fillPriority("radial-gradient");
      }
      shape.fillPriority("fill");
      activeWedge = shape;
    }
  }
}
let anim = new Konva.Animation(animate, layer);
function init() {
  stage = new Konva.Stage({
    container: "container",
    width: width,
    height: height
  });
  layer = new Konva.Layer();
  wheel = new Konva.Group({
    x: stage.width() / 2,
    y: 410
  });
  for (let n = 0; n < numWedges; n++) {
    addWedge(n);
  }
  pointer = new Konva.Wedge({
    fillRadialGradientStartPoint: 0,
    fillRadialGradientStartRadius: 0,
    fillRadialGradientEndPoint: 0,
    fillRadialGradientEndRadius: 30,
    fillRadialGradientColorStops: [0, "white", 1, "red"],
    stroke: "white",
    strokeWidth: 2,
    lineJoin: "round",
    angle: 1,
    radius: 30,
    x: stage.width() / 2,
    y: 33,
    rotation: -90,
    shadowColor: "black",
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowBlur: 2,
    shadowOpacity: 0.5
  });
  // add components to the stage
  layer.add(wheel);
  layer.add(pointer);
  stage.add(layer);
  // bind events
  wheel.on("mousedown touchstart", function(evt) {
    angularVelocity = 0;
    controlled = true;
    target = evt.target;
    finished = false;
  });
}
init();
// });
document.getElementById("spin").addEventListener("click", function() {
  anim.start();
});
