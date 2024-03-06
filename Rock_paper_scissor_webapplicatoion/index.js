const CLASSES = {
  0: 'rock',
  1: 'paper',
  2: 'scissor'
};

const WINNING_MOVES = {
  rock: 'paper',
  paper: 'scissor',
  scissor: 'rock'
};

const MODEL_PATH = 'model.json';
const IMAGE_SIZE = 192;

let model;
let video;
let canvas;
let ctx;
let stream;

async function loadModel() {
  try {
      model = await tf.loadLayersModel(MODEL_PATH);
      document.getElementById('status').innerText = 'Model loaded successfully';

      // Access the webcam
      video = document.getElementById('video');
      canvas = document.getElementById('canvas');
      ctx = canvas.getContext('2d');

      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      video.addEventListener('loadeddata', () => {
          document.getElementById('status').innerText = 'Model and webcam ready';
      });
  } catch (error) {
      console.error('Error loading model:', error);
  }
}

async function captureAndPredict() {
  try {
      // Capture a frame from the webcam
      ctx.drawImage(video, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
      const imgData = ctx.getImageData(0, 0, IMAGE_SIZE, IMAGE_SIZE);
      const img = tf.browser.fromPixels(imgData).toFloat().div(255.0).reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);

      // Make a prediction through the model
      const logits = model.predict(img);
      const prediction = getTopClass(logits);

      document.getElementById('canvas').width = 640;
      document.getElementById('canvas').height = 480;
      ctx.drawImage(video, 0, 0, 640, 480);

      // Display the prediction
      document.getElementById('prediction').innerText = `Model's Prediction: ${CLASSES[prediction]}`;

      // Get the recommended move to beat the prediction
      const recommendedMove = getRecommendedMove(CLASSES[prediction]);
      document.getElementById('result').innerText = `Move to Win: ${recommendedMove}`;
      document.getElementById('result_img').innerHTML = `<img src="images/${recommendedMove}.png">`;
  } catch (error) {
      console.error('Error capturing and predicting:', error);
  }
}

function getTopClass(logits) {
  const values = logits.dataSync();
  console.log('Prediction values:', values);

  const topClass = values.indexOf(Math.max(...values));
  console.log('Top predicted class:', topClass);

  return topClass;
}

function getRecommendedMove(predictedMove) {
  // Get the move that beats the predicted move
  return WINNING_MOVES[predictedMove];
}

// Load the model when the page is loaded
window.onload = loadModel;
