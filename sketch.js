// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let circleX, circleY;
let circleSize = 100;
let isDragging = false;
let trail = []; // 儲存所有軌跡點

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 初始化圓的位置為視窗中間
  circleX = width / 2;
  circleY = height / 2;

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // 畫出圓
  fill(0, 255, 0, 150); // 半透明綠色
  noStroke();
  ellipse(circleX, circleY, circleSize);

  let currentHand = null; // 儲存目前夾住圓的手

  // 確保至少檢測到一隻手
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // 獲取食指與大拇指的座標
        let indexFinger = hand.keypoints[8];
        let thumb = hand.keypoints[4];

        // 檢查食指與大拇指是否同時觸碰圓的邊緣
        let indexDist = dist(indexFinger.x, indexFinger.y, circleX, circleY);
        let thumbDist = dist(thumb.x, thumb.y, circleX, circleY);

        if (indexDist < circleSize / 2 && thumbDist < circleSize / 2) {
          // 更新圓的位置為兩點的中點
          circleX = (indexFinger.x + thumb.x) / 2;
          circleY = (indexFinger.y + thumb.y) / 2;

          // 設定目前夾住圓的手
          currentHand = hand.handedness;

          // 儲存軌跡點
          trail.push({ x: circleX, y: circleY, color: currentHand === "Right" ? "green" : "red" });
          isDragging = true; // 設定為正在拖曳
        }

        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // Draw lines connecting keypoints in groups
        stroke(0); // Set line color
        strokeWeight(5);

        // Connect keypoints 0 to 4
        connectKeypoints(hand.keypoints, 0, 4);

        // Connect keypoints 5 to 8
        connectKeypoints(hand.keypoints, 5, 8);

        // Connect keypoints 9 to 12
        connectKeypoints(hand.keypoints, 9, 12);

        // Connect keypoints 13 to 16
        connectKeypoints(hand.keypoints, 13, 16);

        // Connect keypoints 17 to 20
        connectKeypoints(hand.keypoints, 17, 20);
      }
    }
  }

  // 如果手指離開，停止拖曳
  if (!currentHand) {
    isDragging = false;
  }

  // 畫出所有軌跡
  noFill();
  for (let i = 1; i < trail.length; i++) {
    stroke(trail[i].color);
    strokeWeight(2);
    line(trail[i - 1].x, trail[i - 1].y, trail[i].x, trail[i].y);
  }

  // 如果停止拖曳，清除軌跡
  if (!isDragging) {
    trail = [];
  }
}

// Helper function to connect keypoints with lines
function connectKeypoints(keypoints, startIdx, endIdx) {
  for (let i = startIdx; i < endIdx; i++) {
    let kp1 = keypoints[i];
    let kp2 = keypoints[i + 1];
    line(kp1.x, kp1.y, kp2.x, kp2.y);
  }
}
