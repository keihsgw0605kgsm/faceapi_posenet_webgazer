const imageScaleFactor = 0.5;
const outputStride = 32;
const flipHorizontal = false;

const player = document.getElementById('video');
const download = document.getElementById('download');
const p_text = document.getElementById('text');
//var detections_json = "No Data";
const modelUrl = './models';
var save_arr = [];
let labels = [
  'UnixTime(ms)',

  'face_score', 'face_boundingBox_x', 'face_boundingBox_y', 'face_boundingBox_width', 'face_boundingBox_height',
  'face_landmark_x0', 'face_landmark_y0', 'face_landmark_x1', 'face_landmark_y1', 'face_landmark_x2', 'face_landmark_y2', 'face_landmark_x3', 'face_landmark_y3',
  'face_landmark_x4', 'face_landmark_y4', 'face_landmark_x5', 'face_landmark_y5', 'face_landmark_x6', 'face_landmark_y6', 'face_landmark_x7', 'face_landmark_y7',
  'face_landmark_x8', 'face_landmark_y8', 'face_landmark_x9', 'face_landmark_y9', 'face_landmark_x10', 'face_landmark_y10', 'face_landmark_x11', 'face_landmark_y11',
  'face_landmark_x12', 'face_landmark_y12', 'face_landmark_x13', 'face_landmark_y13', 'face_landmark_x14', 'face_landmark_y14', 'face_landmark_x15', 'face_landmark_y15',
  'face_landmark_x16', 'face_landmark_y16', 'face_landmark_x17', 'face_landmark_y17', 'face_landmark_x18', 'face_landmark_y18', 'face_landmark_x19', 'face_landmark_y19',
  'face_landmark_x20', 'face_landmark_y20', 'face_landmark_x21', 'face_landmark_y21', 'face_landmark_x22', 'face_landmark_y22', 'face_landmark_x23', 'face_landmark_y23',
  'face_landmark_x24', 'face_landmark_y24', 'face_landmark_x25', 'face_landmark_y25', 'face_landmark_x26', 'face_landmark_y26', 'face_landmark_x27', 'face_landmark_y27',
  'face_landmark_x28', 'face_landmark_y28', 'face_landmark_x29', 'face_landmark_y29', 'face_landmark_x30', 'face_landmark_y30', 'face_landmark_x31', 'face_landmark_y31',
  'face_landmark_x32', 'face_landmark_y32', 'face_landmark_x33', 'face_landmark_y33', 'face_landmark_x34', 'face_landmark_y34', 'face_landmark_x35', 'face_landmark_y35',
  'face_landmark_x36', 'face_landmark_y36', 'face_landmark_x37', 'face_landmark_y37', 'face_landmark_x38', 'face_landmark_y38', 'face_landmark_x39', 'face_landmark_y39',
  'face_landmark_x40', 'face_landmark_y40', 'face_landmark_x41', 'face_landmark_y41', 'face_landmark_x42', 'face_landmark_y42', 'face_landmark_x43', 'face_landmark_y43',
  'face_landmark_x44', 'face_landmark_y44', 'face_landmark_x45', 'face_landmark_y45', 'face_landmark_x46', 'face_landmark_y46', 'face_landmark_x47', 'face_landmark_y47',
  'face_landmark_x48', 'face_landmark_y48', 'face_landmark_x49', 'face_landmark_y49', 'face_landmark_x50', 'face_landmark_y50', 'face_landmark_x51', 'face_landmark_y51',
  'face_landmark_x52', 'face_landmark_y52', 'face_landmark_x53', 'face_landmark_y53', 'face_landmark_x54', 'face_landmark_y54', 'face_landmark_x55', 'face_landmark_y55',
  'face_landmark_x56', 'face_landmark_y56', 'face_landmark_x57', 'face_landmark_y57', 'face_landmark_x58', 'face_landmark_y58', 'face_landmark_x59', 'face_landmark_y59',
  'face_landmark_x60', 'face_landmark_y60', 'face_landmark_x61', 'face_landmark_y61', 'face_landmark_x62', 'face_landmark_y62', 'face_landmark_x63', 'face_landmark_y63',
  'face_landmark_x64', 'face_landmark_y64', 'face_landmark_x65', 'face_landmark_y65', 'face_landmark_x66', 'face_landmark_y66', 'face_landmark_x67', 'face_landmark_y67',

  'pose_nose_score', 'pose_nose_x', 'pose_nose_y',
  'pose_leftEye_score', 'pose_leftEye_x', 'pose_leftEye_y',
  'pose_rightEye_score', 'pose_rightEye_x', 'pose_rightEye_y',
  'pose_leftEar_score', 'pose_leftEar_x', 'pose_leftEar_y',
  'pose_rightEar_score', 'pose_rightEar_x', 'pose_rightEar_y',
  'pose_leftShoulder_score', 'pose_leftShoulder_x', 'pose_leftShoulder_y',
  'pose_rightShoulder_score', 'pose_rightShoulder_x', 'pose_rightShoulder_y',
  'pose_leftElbow_score', 'pose_leftElbow_x', 'pose_leftElbow_y',
  'pose_rightElbow_score', 'pose_rightElbow_x', 'pose_rightElbow_y',
  'pose_leftWrist_score', 'pose_leftWrist_x', 'pose_leftWrist_y',
  'pose_rightWrist_score', 'pose_rightWrist_x', 'pose_rightWrist_y'
]

/**モデルのロード**/
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(modelUrl),
  faceapi.nets.faceLandmark68Net.loadFromUri(modelUrl)
])
.catch((e) => {
  console.log('モデルをロードできません: '+e);
})
.then(save_arr.push(labels)) //セーブデータの項目名の追加
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
  setInterval(async () => {
    // face-api
    const detections = await faceapi.detectAllFaces(player, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    // posenet
    /*posenet.load()
    .then((net) => {
      const pose =  net.estimateSinglePose(player, imageScaleFactor, flipHorizontal, outputStride)
    })
    .catch((e) => {
      consoloe.log(e)
    })*/
    const pose = posenet.load().estimateSinglePose(player, imageScaleFactor, flipHorizontal, outputStride)
    p_text.textContent = pose['keypoints'][0]['position']['x']
    
    //save_arr.push(createSaveData(detections[0], pose));
    save_arr.push(createSaveData(detections[0]));

  }, 1000)
  .catch((e) => {
    console.log('setIntervalでエラー：'+e);
  });
})
.catch((e) => {
  console.log('player.addEventListenerでエラー：'+e);
});

/** jsonファイルのダウンロード **/
/*function handleDownload() {
  var blob = new Blob([ detections_json ], { "type" : "text/plain" });
  var url = window.URL.createObjectURL(blob);
  download.href = url;
  window.navigator.msSaveBlob(blob, "test.json"); 
}*/

/** csvファイルのダウンロード **/
function handleDownload() { 
  let data = save_arr.map((arr)=>arr.join(',')).join('\r\n');
  var bom = new Uint8Array([0xEF, 0xBB, 0xBF])
  var blob = new Blob([ bom, data ], { "type" : "text/csv" });
  let url = (window.URL || window.webkitURL).createObjectURL(blob);
  download.href = url;
  window.navigator.msSaveBlob(blob, "test.csv");
}

/** 保存データの作成 **/
// 入力：顔認識のjson
// 出力：その時刻の一次元配列
function createSaveData(detections) {
  var arr = []

  // UnixTime(ms)
  var date = new Date();
  arr.push(date.getTime())

  // face-apiのscore
  arr.push(detections['detection']['_score'])

  // face-apiのバウンディングボックス情報
  arr.push(detections['detection']['_box']['_x'])
  arr.push(detections['detection']['_box']['_y'])
  arr.push(detections['detection']['_box']['_width'])
  arr.push(detections['detection']['_box']['_height'])

  // face-apiの顔特徴点68点
  for(let i = 0; i < 68; i++) {
    arr.push(detections['landmarks']['_positions'][i]['_x'])
    arr.push(detections['landmarks']['_positions'][i]['_y'])
  }

  // nose(0), eye(1,2), ear(3,4), shoulder(5,6), elbow(7,8), wrist(9,10)の情報
  /*for(let i = 0; i < 11; i++) {
    arr.push(pose['keypoints'][i]['score'])
    arr.push(pose['keypoints'][i]['position']['x'])
    arr.push(pose['keypoints'][i]['position']['y'])
  }*/

  return arr;
}