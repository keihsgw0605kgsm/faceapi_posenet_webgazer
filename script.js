const player = document.getElementById('video');
//const text = document.getElementById('text');
const download = document.getElementById('download');
var detections_json = "No Data";
const modelUrl = './models';

/**モデルのロード**/
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
  //faceapi.nets.ssdMobilenetv1.loadFromUri(modelUrl),
  faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl),
  //faceapi.nets.faceRecognitionNet.loadFromUri(modelUrl),
  //faceapi.nets.faceExpressionNet.loadFromUri(modelUrl)
])
.catch((e) => {
  console.log('モデルをロードできません: '+e);
})
.then(startVideo);

/**カメラを用いたビデオストリーミング**/
function startVideo() {
  var constraints = {
    audio: true,
    video: {
      width: player.width,
      height: player.height
    }
  };
  
  navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    player.srcObject = stream;
    player.onloadedmetadata = function(e) {
      player.play();
    };
  })
  .catch(function(err) {
    console.log(err.name+": "+err.message);
  });
};

/**カメラオン時のイベント**/
player.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(player);
  document.body.append(canvas);
  const displaySize = { width: player.width, height: player.height };
  faceapi.matchDimensions(canvas, displaySize);
  
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(player, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

    //結果の出力
    //console.log(detections);
    //text.textContent = JSON.stringify(detections);
    detections_json = JSON.stringify(detections);
  }, 500)
  .catch((e) => {
    console.log('setIntervalでエラー：'+e);
  });
})
.catch((e) => {
  console.log('player.addEventListenerでエラー：'+e);
});

download.addEventListener('click', () => {
  var blob = new Blob(["あいうえお"], {type: "text/plain"});

  if (window.navigator.msSaveBlob) { 
    window.navigator.msSaveBlob(blob, "test.txt"); 
    //window.navigator.msSaveOrOpenBlob(blob, "test.txt"); 
  } else {
    document.getElementById("download").href = window.URL.createObjectURL(blob);
  }
});