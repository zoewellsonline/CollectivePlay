// Open and connect input socket
let socket = io();

// Listen for confirmation of connection
socket.on("connect", function() {
  console.log("Connected", socket.id);
});

// String being typed
let str = "";

//store the prompt
let prompt="This is going to be the prompt";
// Is it my turn?
let myTurn = false;
// Canvas element
let cnv;
// Margin;
let m = 10;

function setup() {
  
  cnv = createCanvas(windowWidth, windowHeight);
  // Disable canvas by deafult
  cnv.addClass("disabled");

  // Text styling
  textAlign(LEFT, TOP);
  textSize(32);

  // Draw string once connected
  drawString();

  // Listen for my turn
  socket.on("go", function() {
    myTurn = true;
    // Enable can       vas
    cnv.removeClass("disabled");
    cnv.removeClass("hidden");
    // Update instructions on screen
    drawString();
  });

  // Listen for changes to text
  socket.on("add", function(data) {
    // Update string
    str += data;
    // Update string on screen
    drawString();
  });

  socket.on("remove", function() {
    // Remove last character from string
    str = str.substring(0, str.length - 1);
    // Update string on screen
    drawString();
  });
  //change the prompt when recieve it;
  socket.on("prompt",function(data){
    console.log('received prompt: '+data)
    prompt=data;
    drawString();
  });
}

// Draw string, character by character
function drawString() {
  // Draw a white background
  background(255);
  console.log(str);

  // Start in upper left-hand corner
  let x = m;
  // I added 40 to save space for the prompt
  let y = m+40;
  fill(0);
  
  text(prompt,m,m);
  // If there's nothing yet...
  // Show instructions
  if (str.length == 0) {
    text(myTurn ? "type a word" : "wait...", x, y);

    // The above is the same as:
    // if (myTurn) text('type a word', x, y);
    // else text('wait...', x, y);
  } else {
    let words = str.split(" ");
    let visibleString = "";

    // if short display all
    if (words.length < 3) {
      for (let c = 0; c < str.length; c++) {
        let char = str.charAt(c);
        text(char, x, y);
        x += textWidth(char);
        // Wrap text to next line
        if (x > width - m) {
          x = 0;
          y += textAscent("h") + textDescent("p");
        }
      }
      // if longer display last six
    } else {
      for (let i = words.length - 3; i < words.length; i++) {
        visibleString = visibleString + words[i] + " ";
      }

      for (let c = 0; c < visibleString.length; c++) {
        let char = visibleString.charAt(c);
        text(char, x, y);
        x += textWidth(char);
        // Wrap text to next line
        if (x > width - m) {
          x = 0;
          y += textAscent("h") + textDescent("p");
        }
      }
    }
  }
}

// Only listen for ASCII keystrokes
function keyTyped() {
  // Ignore if it's not your turn
  if (!myTurn) return;

  // Send data
  socket.emit("add", key);
}

// Delete things
function keyPressed() {
  // Ignore if it's not your turn
  if (!myTurn) return;

  // Send message to remove
  if (keyCode == DELETE || keyCode == BACKSPACE) {
    socket.emit("remove");
  }
  // You're done with your turn at each word break
  else if (keyCode == ENTER || key == " ") {
    // Send a space
    socket.emit("add", " ");
    socket.emit("next");
    // No longer your turn
    myTurn = false;
    // Disable canvas
    cnv.addClass("hidden");
  }
}
