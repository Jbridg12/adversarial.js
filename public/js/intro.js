import {fgsmTargeted, bimTargeted, jsmaOnePixel, jsma, cw} from './adversarial.js';
import {MNIST_CLASSES, FMNIST_CLASSES, CIFAR_CLASSES, IMAGENET_CLASSES} from './class_names.js';

/* eslint-disable no-unused-vars */
import * as tf from '../../node_modules/@tensorflow/tfjs';
/************************************************************************
* Global constants
************************************************************************/

const $ = query => document.querySelector(query);

const MNIST_CONFIGS = {
  'fgsmTargetedWeak': {ε: 0.2},  // Targeted FGSM works slightly better on MNIST with higher distortion
  'fgsmTargetedMedium': {ε: 0.4},
  'fgsmTargetedStrong': {ε: 0.8},
  'bimTargeted': {iters: 20},  // Targeted BIM works slightly better on MNIST with more iterations (pushes misclassification confidence up)
};

const FMNIST_CONFIGS = {
  'fgsmTargetedWeak': {ε: 0.2},  // Targeted FGSM works slightly better on MNIST with higher distortion
  'fgsmTargetedMedium': {ε: 0.4},
  'fgsmTargetedStrong': {ε: 0.8},
  'bimTargeted': {iters: 20},  // Needs more iterations to work well
};

const CIFAR_CONFIGS = {
  'fgsmTargetedWeak': {ε: 0.1, loss: 1},  // 0.1 L_inf perturbation is too visible in color
  'fgsmTargetedMedium': {ε: 0.2, loss: 1},
  'fgsmTargetedStrong': {ε: 0.6, loss: 1},
  'jsmaOnePixel': {ε: 75},  // JSMA one-pixel on CIFAR-10 requires more ~3x pixels than MNIST
  'jsma': {ε: 75},  // JSMA on CIFAR-10 also requires more ~3x pixels than MNIST
  'cw': {c: 1, λ: 0.05}  // Tried to minimize distortion, but not sure it worked
};

const IMAGENET_CONFIGS = {
  'fgsmTargetedWeak': {ε: 0.1, loss: 1},  // 0.1 L_inf perturbation is too visible in color
  'fgsmTargetedMedium': {ε: 0.2, loss: 1}, // Loss 2 does not work on Imagenet
  'fgsmTargetedStrong': {ε: 0.4, loss: 1},
  'jsmaOnePixel': {ε: 75},  // This is unsuccessful. I estimate that it requires ~50x higher ε than CIFAR-10 to be successful on ImageNet, but that is too slow
  'cw': {κ: 5, c: 1, λ: 0.05}  // Generate higher confidence adversarial examples, and minimize distortion
};

/************************************************************************
* Load Datasets
************************************************************************/

/****************************** Load MNIST ******************************/

let mnistDataset;
let mnistUrl = 'data/mnist/mnist_sample.csv';
let loadingMnist = tf.data.csv(mnistUrl, {columnConfigs: {label: {isLabel: true}}})
  .map(({xs, ys}) => {
    xs = Object.values(xs).map(e => e/255);  // Convert from feature object to array, and normalize
    ys = tf.oneHot(Object.values(ys), 10).squeeze();  // Convert from feature object to scalar, and turn into one-hot vector
    return {xs: xs, ys: ys};
  })
  .batch(1)
  .toArray()
  .then(ds => mnistDataset = ds);

/****************************** Load CIFAR-10 ******************************/

let cifarXUrl = 'data/cifar/cifar10_sample_x.json';
let cifarYUrl = 'data/cifar/cifar10_sample_y.json';

// Load data in form [{xs: x0_tensor, ys: y0_tensor}, {xs: x1_tensor, ys: y1_tensor}, ...]
let cifarX, cifarY, cifarDataset;
let loadingCifarX = fetch(cifarXUrl).then(res => res.json()).then(arr => cifarX = tf.data.array(arr).batch(1));
let loadingCifarY = fetch(cifarYUrl).then(res => res.json()).then(arr => cifarY = tf.data.array(arr).batch(1));
let loadingCifar = Promise.all([loadingCifarX, loadingCifarY]).then(() => tf.data.zip([cifarX, cifarY]).toArray()).then(ds => cifarDataset = ds.map(e => { return {xs: e[0], ys: e[1]}}));

/****************************** Load Fashion MNIST ******************************/

let fmnistXUrls = [
  '../data/fashion_mnist/0_t-shirt.png',
  '../data/fashion_mnist/1_trouser.png',
  '../data/fashion_mnist/2_pullover.png',
  '../data/fashion_mnist/4_coat.png',
  '../data/fashion_mnist/8_bag.png',
  '../data/fashion_mnist/9_ankle_boot.png'
]

let fmnistYLbls = [0, 1, 2, 4, 8, 9]
let fmnistY = fmnistYLbls.map(lbl => tf.oneHot(lbl, 10).reshape([1, 10]));

// Utility function that loads an image in a given <img> tag and returns a Promise
function loadImage(e, url) {
  return new Promise((resolve) => {
    e.addEventListener('load', () => resolve(e));
    e.src = url;
  });
}

// Load each image
let loadingFmnistX = [];
for (let i = 20; i < (fmnistXUrls.length + 20); i++) {
  document.getElementsByClassName(i.toString()).forEach(e => {
    let loadingImage = loadImage(e, fmnistXUrls[i-20]);
    loadingFmnistX.push(loadingImage);
  });
}

// Collect pixel data from each image
let fmnistX = [];
let loadedFmnistData = Promise.all(loadingFmnistX);
loadedFmnistData.then(() => {
  for (let i = 20; i < (fmnistXUrls.length + 20); i++) {
    let img = document.getElementsByClassName(i.toString())[0];
    fmnistX.push(tf.browser.fromPixels(img).div(255.0).reshape([1, 28, 28, 3]));
  }
});

/****************************** Load ImageNet ******************************/

let imagenetXUrls = [
  '../data/imagenet/574_golf_ball.jpg',
  '../data/imagenet/217_english_springer.jpg',
  '../data/imagenet/701_parachute.jpg',
  '../data/imagenet/0_tench.jpg',
  '../data/imagenet/497_church.jpg',
  '../data/imagenet/566_french_horn.jpg'
]
let imagenetYLbls = [574, 217, 701, 0, 497, 566]
let imagenetY = imagenetYLbls.map(lbl => tf.oneHot(lbl, 1000).reshape([1, 1000]));

// Load each image
let loadingImagenetX = [];
for (let i = 0; i < imagenetXUrls.length; i++) {
  document.getElementsByClassName(i.toString()).forEach(e => {
    let loadingImage = loadImage(e, imagenetXUrls[i]);
    loadingImagenetX.push(loadingImage);
  });
}

// Collect pixel data from each image
let imagenetX = [];
let loadedImagenetData = Promise.all(loadingImagenetX);
loadedImagenetData.then(() => {
  for (let i = 0; i < imagenetXUrls.length; i++) {
    let img = document.getElementsByClassName(i.toString())[0];
    imagenetX.push(tf.browser.fromPixels(img).div(255.0).reshape([1, 224, 224, 3]));
  }
});

/************************************************************************
* Load Models
************************************************************************/

/****************************** Load MNIST ******************************/

let mnistXception;
let mnistResnet;
let mnistVgg16;
let mnistMobilenet;
async function loadMnistModel() {
  if (mnistVgg16 == undefined) { mnistVgg16 = await tf.loadGraphModel('data/mnist/vgg16/model.json'); }
  if (mnistResnet == undefined) { mnistResnet = await tf.loadGraphModel('data/mnist/resnet/model.json'); }
  if (mnistXception == undefined) { mnistXception = await tf.loadGraphModel('data/mnist/xception/model.json'); }
  if (mnistMobilenet == undefined) { mnistMobilenet = await tf.loadGraphModel('data/mnist/mobilenet/model.json'); }
  //mnistModel = await tf.loadLayersModel('data/mnist/mnist_dnn.json');
}

/****************************** Load CIFAR-10 ******************************/

let cifarVgg16;
let cifarResnet;
let cifarXception;
let cifarMobilenet;
async function loadCifarModel() {
  if (cifarVgg16 == undefined) { cifarVgg16 = await tf.loadGraphModel('data/cifar/vgg16/model.json'); }
  if (cifarResnet == undefined) { cifarResnet = await tf.loadGraphModel('data/cifar/resnet/model.json'); }
  if (cifarXception == undefined) { cifarXception = await tf.loadGraphModel('data/cifar/xception/model.json'); }
  if (cifarMobilenet == undefined) { cifarMobilenet = await tf.loadGraphModel('data/cifar/mobilenet/model.json'); }
}

/****************************** Load FMNIST ******************************/

let fmnistVgg16;
let fmnistResnet;
let fmnistXception;
let fmnistMobilenet;

async function loadFmnistModel() {
  if (fmnistVgg16 == undefined) { fmnistVgg16 = await tf.loadGraphModel('data/fashion_mnist/vgg16/model.json'); }
  if (fmnistResnet == undefined) { fmnistResnet = await tf.loadGraphModel('data/fashion_mnist/resnet/model.json'); }
  if (fmnistXception == undefined) { fmnistXception = await tf.loadGraphModel('data/fashion_mnist/xception/model.json'); }
  if (fmnistMobilenet == undefined) { fmnistMobilenet = await tf.loadGraphModel('data/fashion_mnist/mobilenet/model.json'); }
}

/****************************** Load ImageNet ******************************/

let imagenetVgg16;
let imagenetResnet;
let imagenetXception;
let imagenetMobilenet;
async function loadImagenetModel() {
  if (imagenetVgg16 == undefined) { imagenetVgg16 = await tf.loadGraphModel('data/imagenet/vgg16/model.json'); }
  if (imagenetResnet == undefined) { imagenetResnet = await tf.loadGraphModel('data/imagenet/resnet/model.json'); }
  if (imagenetXception == undefined) { imagenetXception = await tf.loadGraphModel('data/imagenet/xception/model.json'); }
  if (imagenetMobilenet == undefined) { imagenetMobilenet = await tf.loadGraphModel('data/imagenet/mobilenet/model.json'); }
}

/************************************************************************
* Web Component Event Functions
************************************************************************/

// On page load
window.addEventListener('load', showImage);

// Model selection dropdown
let architecture = "resnet"
export function changeArchitecture(arch){
	architecture = arch;
	showImage();
	resetPrediction();
	resetAdvPrediction();
}

// Dataset selection dropdown
let dataset = "mnist"
export function changeDataset(ds){
	dataset = ds
	showImage();
	resetPrediction();
	resetAdvPrediction();
}

// Next image button
export function nextImage(){
	if (dataset === 'upload'){dataset = revertDataset;}
	showNextImage();
	resetPrediction();
	resetAdvPrediction();
}

// Upload image button
let revertDataset;
export function uploadImage(){
	revertDataset = dataset;
	dataset = 'upload';
	getImg();
	resetPrediction();
	resetAdvPrediction();
}

// Predict button (original image
export function predictImg(){
    predict();
}

// Target label dropdown
let selectedTarget = 0;
export function changeTarget(target){
	resetAdvPrediction();
	selectedTarget =  parseInt(target);
}

// Attack algorithm dropdown
let selectedAttack;
export function changeAttack(attack){
	resetAdvPrediction();
	selectedAttack = attack;
}

// Generate button
export function attack(){
  showLoader();
  resetAdvPrediction();
  generateAdv();
}

export function download(){
  let canvas = document.getElementById('adversarial');
  var a = document.createElement('a');
  a.href = canvas.toDataURL();
  a.download = "adversarial.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

let noise;
export function resetNoise() {
  noise = document.getElementById('adversarial-noise')
  let context = noise.getContext('2d')
  context.clearRect(0, 0, noise.width, noise.height)
}

let adv;
export function resetAdv() {
  adv = document.getElementById('adversarial')
  let context = adv.getContext('2d')
  context.clearRect(0, 0, adv.width, adv.height)
}

export function showLoader() {
  var myDiv = document.getElementById("loadSpinner");
  myDiv.setAttribute("style", "display: block;");
}
export function hideLoader() {
  var myDiv = document.getElementById("loadSpinner");
  myDiv.setAttribute("style", "display: none;");
}

/************************************************************************
* Define Event Handlers
************************************************************************/

/**
 * Gets image uploaded by the user. 
 */
let uploadLblIdx = 0;
let loadedUpload;
async function getImg(){
	const input = document.getElementById("fileid");
	let source = input.files[0];
	
	let loadingUpload= [];
	document.getElementsByClassName("upload_img").forEach(e => {
		loadingUpload.push(loadImage(e, URL.createObjectURL(source)));
	});
	
	let loadedUploadData = Promise.all(loadingUpload);
	
	await loadedUploadData.then(() => {
		let imgCon = document.getElementsByClassName("upload_img")[0];
		let img = tf.browser.fromPixels(imgCon).div(255.0);
		img = tf.image.resizeNearestNeighbor(img, [224, 224]);
		
		loadedUpload = img.reshape([1, 224, 224, 3]);
	});
	
	drawImg(loadedUpload, "original");
  drawImg(loadedUpload, "og");
}

/**
 * Renders the next image from the sample dataset in the original canvas
 */
function showNextImage() {
  if (dataset === 'mnist') { showNextMnist(); }
  else if (dataset === 'cifar') { showNextCifar(); }
  else if (dataset === 'fmnist') { showNextFmnist(); }
  else if (dataset === 'imagenet') { showNextImagenet(); }
}

/**
 * Renders the current image from the sample dataset in the original canvas
 */
function showImage() {
  if (dataset === 'mnist') { showMnist(); }
  else if (dataset === 'cifar') { showCifar(); }
  else if (dataset === 'fmnist') { showFmnist(); }
  else if (dataset === 'imagenet') { showImagenet(); }
}

/**
 * Computes & displays prediction of the current original image
 */
async function predict() {

  let model;
  console.log(architecture);
  showLoader();
  if (dataset === 'mnist') {
    
    
    await loadMnistModel();
    await loadingMnist;    
    
    if (architecture === 'resnet') { model = mnistResnet; }
    else if (architecture === 'vgg16') {model = mnistVgg16; }
    else if (architecture === 'xception') {model = mnistXception; }
    else if (architecture === 'mobilenet') {model = mnistMobilenet; }
    
    let lblIdx = mnistDataset[mnistIdx].ys.argMax(1).dataSync()[0];

    let img = mnistDataset[mnistIdx].xs;
    let resizedImg = tf.image.resizeNearestNeighbor(img.reshape([1, 28, 28, 1]), [32, 32]);
    let RGB = tf.image.grayscaleToRGB(resizedImg);
    _predict(model, RGB, lblIdx, MNIST_CLASSES);
  } else if (dataset === 'cifar') {
    await loadCifarModel();
    await loadingCifar;
    
    if (architecture === 'resnet') { model = cifarResnet; }
    else if (architecture === 'vgg16') {model = cifarVgg16; }
    else if (architecture === 'xception') {model = cifarXception; }
    else if (architecture === 'mobilenet') {model = cifarMobilenet; }
    
    let lblIdx = cifarDataset[cifarIdx].ys.argMax(1).dataSync()[0];
    _predict(model, cifarDataset[cifarIdx].xs, lblIdx, CIFAR_CLASSES);
  } else if (dataset === 'fmnist') {
    await loadFmnistModel();
    await loadingFmnistX;
    
    if (architecture === 'resnet') { model = fmnistResnet; }
    else if (architecture === 'vgg16') {model = fmnistVgg16; }
    else if (architecture === 'xception') {model = fmnistXception; }
    else if (architecture === 'mobilenet') {model = fmnistMobilenet; }
    
    _predict(model, tf.image.resizeNearestNeighbor(fmnistX[fmnistIdx], [32,32]), fmnistYLbls[fmnistIdx], FMNIST_CLASSES);
  } else if (dataset === 'imagenet') {
    await loadImagenetModel();
    await loadedImagenetData;

    if (architecture === 'resnet') { model = imagenetResnet; }
    else if (architecture === 'vgg16') {model = imagenetVgg16; }
    else if (architecture === 'xception') {model = imagenetXception; }
    else if (architecture === 'mobilenet') {model = imagenetMobilenet; }
	

  // Xception architecture requires a resized image for imagenet
	if (architecture === 'xception') { 
		_predict(model, tf.image.resizeNearestNeighbor(imagenetX[imagenetIdx], [299,299]), imagenetYLbls[imagenetIdx], IMAGENET_CLASSES);
	}
	else{
		_predict(model, imagenetX[imagenetIdx], imagenetYLbls[imagenetIdx], IMAGENET_CLASSES);
	}
    
  } else if (dataset === 'upload') {
    await loadImagenetModel();
    await loadedImagenetData;
    
    if (architecture === 'resnet') { model = imagenetResnet; }
    else if (architecture === 'vgg16') {model = imagenetVgg16; }
    else if (architecture === 'xception') {model = imagenetXception; }
    else if (architecture === 'mobilenet') {model = imagenetMobilenet; }
	
	if (architecture === 'xception') { 
		_predict(model, tf.image.resizeNearestNeighbor(loadedUpload, [299,299]), 'upload', IMAGENET_CLASSES);
	}
	else{
		_predict(model, loadedUpload, 'upload', IMAGENET_CLASSES);
	}
  }

  function _predict(model, img, lblIdx, CLASS_NAMES) {
    // Generate prediction
    let pred = model.predict(img);
    let predLblIdx = pred.argMax(1).dataSync()[0];
    let predProb = pred.max().dataSync()[0];
    if (dataset === 'upload') {uploadLblIdx = predLblIdx;}

    // Display prediction
    let status;
    if(dataset === 'upload'){
      status = {msg: 'You tell me!', statusClass: 'status-green'};
    }
    else if (predLblIdx === lblIdx) {
      status = {msg: '✅ Prediction is Correct.', statusClass: 'status-green'};  // Predictions on the sample should always be correct
    }
    else {
      status = {msg: '❌ Prediction is Incorrect.', statusClass: 'status-red'};  // Predictions on the sample should always be correct
    }
    showPrediction(`"${CLASS_NAMES[predLblIdx]}"<br/>Probability: ${(predProb * 100).toFixed(2)}%`, status);
  }
  hideLoader();
 }

/**
 * Generates adversarial example from the current original image
 */
let advPrediction, advStatus;
async function generateAdv() {

  let attack;
  console.log(selectedAttack);
  showLoader();
  switch (selectedAttack) {
    case 'fgsmTargetedWeak': attack = fgsmTargeted; break;
    case 'fgsmTargetedMedium': attack = fgsmTargeted; break;
    case 'fgsmTargetedStrong': attack = fgsmTargeted; break;
    case 'bimTargeted': attack = bimTargeted; break;
    case 'jsmaOnePixel': attack = jsmaOnePixel; break;
    case 'jsma': attack = jsma; break;
    case 'cw': attack = cw; break;
  }
    
  let adv_model;
  let targetLblIdx = selectedTarget;
  if (dataset === 'mnist') {
    await loadMnistModel();
    await loadingMnist;
    
    if (architecture === 'resnet') { adv_model = mnistResnet; }
    else if (architecture === 'vgg16') {adv_model = mnistVgg16; }
    else if (architecture === 'xception') {adv_model = mnistXception; }
    else if (architecture === 'mobilenet') {adv_model = mnistMobilenet; }
    
    let img = mnistDataset[mnistIdx].xs;
    let resizedImg = tf.image.resizeNearestNeighbor(img.reshape([1, 28, 28, 1]), [32, 32]);
    let RGB = tf.image.grayscaleToRGB(resizedImg);
    
    await _generateAdv(adv_model, RGB, mnistDataset[mnistIdx].ys, MNIST_CLASSES, MNIST_CONFIGS[selectedAttack]);
  } 
  else if (dataset === 'cifar') {
    await loadCifarModel();
    await loadingCifar;
    
    if (architecture === 'resnet') { adv_model = cifarResnet; }
    else if (architecture === 'vgg16') {adv_model = cifarVgg16; }
    else if (architecture === 'xception') {adv_model = cifarXception; }
    else if (architecture === 'mobilenet') {adv_model = cifarMobilenet; }
    
    await _generateAdv(adv_model, cifarDataset[cifarIdx].xs, cifarDataset[cifarIdx].ys, CIFAR_CLASSES, CIFAR_CONFIGS[selectedAttack]);
  } 
  else if (dataset === 'fmnist') {
    await loadFmnistModel();
    await loadingFmnistX;
    
    if (architecture === 'resnet') { adv_model = fmnistResnet; }
    else if (architecture === 'vgg16') {adv_model = fmnistVgg16; }
    else if (architecture === 'xception') {adv_model = fmnistXception; }
    else if (architecture === 'mobilenet') {adv_model = fmnistMobilenet; }
    
    await _generateAdv(adv_model, tf.image.resizeNearestNeighbor(fmnistX[fmnistIdx], [32,32]), fmnistY[fmnistIdx], FMNIST_CLASSES, FMNIST_CONFIGS[selectedAttack]);
  } 
  else if (dataset === 'imagenet') {
    await loadImagenetModel();
    await loadedImagenetData;
    
    if (architecture === 'resnet') { adv_model = imagenetResnet; }
    else if (architecture === 'vgg16') {adv_model = imagenetVgg16; }
    else if (architecture === 'xception') {adv_model = imagenetXception; }
    else if (architecture === 'mobilenet') {adv_model = imagenetMobilenet; }
    
    if (architecture === 'xception') { 
      await _generateAdv(adv_model, tf.image.resizeNearestNeighbor(imagenetX[imagenetIdx], [299,299]), imagenetY[imagenetIdx], IMAGENET_CLASSES, IMAGENET_CONFIGS[selectedAttack]);
    }
    else {
      await _generateAdv(adv_model, imagenetX[imagenetIdx], imagenetY[imagenetIdx], IMAGENET_CLASSES, IMAGENET_CONFIGS[selectedAttack]);
    }
  } else if (dataset === 'upload') {
    await loadImagenetModel();
    await loadedImagenetData;
    
    if (architecture === 'resnet') { adv_model = imagenetResnet; }
    else if (architecture === 'vgg16') {adv_model = imagenetVgg16; }
    else if (architecture === 'xception') {adv_model = imagenetXception; }
    else if (architecture === 'mobilenet') {adv_model = imagenetMobilenet; }
    
    if (architecture === 'xception') { 
      await _generateAdv(adv_model, tf.image.resizeNearestNeighbor(loadedUpload, [299,299]), tf.oneHot(uploadLblIdx, 1000).reshape([1, 1000]), IMAGENET_CLASSES, IMAGENET_CONFIGS[selectedAttack]);
    }
    else{
      await _generateAdv(adv_model, loadedUpload, tf.oneHot(uploadLblIdx, 1000).reshape([1, 1000]), IMAGENET_CLASSES, IMAGENET_CONFIGS[selectedAttack]);
    }
  }

  async function _generateAdv(model, img, lbl, CLASS_NAMES, CONFIG) {
    // Generate adversarial example
    let targetLbl = tf.oneHot(targetLblIdx, lbl.shape[1]).reshape(lbl.shape);
    let aimg = tf.tidy(() => attack(model, img, lbl, targetLbl, CONFIG));

    // Display adversarial example
    await drawImg(aimg, 'adversarial');
    await drawImg(aimg, 'og');

    // Compute & store adversarial prediction
    let pred = model.predict(aimg);
    let predLblIdx = pred.argMax(1).dataSync()[0];
    let predProb = pred.max().dataSync()[0];
    advPrediction = ` "${CLASS_NAMES[predLblIdx]}"<br/>Probability: ${(predProb * 100).toFixed(2)}%`;

    // Compute & store attack success/failure message
    let lblIdx = lbl.argMax(1).dataSync()[0];
    if (predLblIdx === targetLblIdx) {
      advStatus = {msg: '❌ Prediction is wrong. Attack succeeded!', statusClass: 'status-red'};
    } else if (predLblIdx !== lblIdx) {
      advStatus = {msg: '❌ Prediction is wrong. Attack partially succeeded!', statusClass: 'status-orange'};
    } else {
      advStatus = {msg: '✅ Prediction is still correct. Attack failed.', statusClass: 'status-green'};
    }
    
    // Displays prediction for the current adversarial image
    hideLoader();
    showAdvPrediction(advPrediction, advStatus);
    console.log(advStatus);

    // Also compute and draw the adversarial noise (hidden until the user clicks on it)
    let noise = tf.sub(aimg, img).add(0.5).clipByValue(0, 1);  // [Szegedy 14] Intriguing properties of neural networks
    drawImg(noise, 'adversarial-noise');
    
    
  }
}

/**
 * Show adversarial noise when the user clicks on the "view noise" link
 */
async function viewNoise() {
  $('#difference').style.display = 'none';
  $('#difference-noise').style.display = 'block';
  $('#adversarial').style.display = 'none';
  $('#adversarial-noise').style.display = 'block';
}

/**
 * Show adversarial image when the user clicks on the "view image" link
 */
async function viewImage() {
  $('#difference').style.display = 'block';
  $('#difference-noise').style.display = 'none';
  $('#adversarial').style.display = 'block';
  $('#adversarial-noise').style.display = 'none';
}

/**
 * Reset entire dashboard UI when a new image is selected
 */
function resetOnNewImage() {
  //$('#predict-original').disabled = false;
  //$('#predict-original').innerText = 'Run Neural Network';
  $('#prediction').style.display = 'none';
  $('#prediction-status').innerHTML = '';
  $('#prediction-status').className = '';
  $('#prediction-status').style.marginBottom = '9px';
}

/**
 * Returns if the current device supports WebGL 32-bit
 * https://www.tensorflow.org/js/guide/platform_environment#precision
 */
function supports32BitWebGL() {
  return tf.ENV.getBool('WEBGL_RENDER_FLOAT32_CAPABLE') && tf.ENV.getBool('WEBGL_RENDER_FLOAT32_ENABLED');
}

/************************************************************************
* Formatting for displaying/removing results from visibility
************************************************************************/

function resetPrediction() {
  $('#prediction').innerHTML = '';
  $('#prediction').style.display = 'inline';
  $('#prediction-status').innerHTML = '';
  $('#prediction-status').className = '';
}

function showPrediction(msg, status) {
  console.log("predicting, no writing");
  $('#prediction').innerHTML = msg;
  $('#prediction').style.display = 'inline';
  $('#prediction-status').innerHTML = status.msg;
  $('#prediction-status').className = status.statusClass;
}

function resetAdvPrediction() {
  $('#prediction-adv').innerHTML = '';
  $('#prediction-adv').style.display = 'inline';
  $('#prediction-adv-status').innerHTML = '';
  $('#prediction-adv-status').className = '';
}
function showAdvPrediction(msg, status) {
  $('#prediction-adv').innerHTML = msg;
  $('#prediction-adv').style.display = 'inline';
  $('#prediction-adv-status').innerHTML = status.msg;
  $('#prediction-adv-status').className = status.statusClass;
}

/************************************************************************
* Visualize Images
************************************************************************/

let mnistIdx = 0;
async function showMnist() {
  await loadingMnist;
  await drawImg(mnistDataset[mnistIdx].xs, 'original');
  await drawImg(mnistDataset[mnistIdx].xs, 'og');
}
async function showNextMnist() {
  mnistIdx = (mnistIdx + 1) % mnistDataset.length;
  await showMnist();
}

let cifarIdx = 0;
async function showCifar() {
  await loadingCifar;
  await drawImg(cifarDataset[cifarIdx].xs, 'original');
  await drawImg(cifarDataset[cifarIdx].xs, 'og');
}
async function showNextCifar() {
  cifarIdx = (cifarIdx + 1) % cifarDataset.length;
  await showCifar();
}

let fmnistIdx = 0;
async function showFmnist() {
  await loadingFmnistX;
  await drawImg(fmnistX[fmnistIdx], 'original');
  await drawImg(fmnistX[fmnistIdx], 'og');
}
async function showNextFmnist() {
  fmnistIdx = (fmnistIdx + 1) % fmnistX.length;
  await showFmnist();
}

let imagenetIdx = 0;
async function showImagenet() {
  await loadingImagenetX;
  await drawImg(imagenetX[imagenetIdx], 'original');
  await drawImg(imagenetX[imagenetIdx], 'og');
}
async function showNextImagenet() {
  imagenetIdx = (imagenetIdx + 1) % imagenetX.length;
  await showImagenet();
}

async function drawImg(img, element) {
  // Draw image
  let canvas = document.getElementById(element);
  if (img.shape[0] === 1) { img = img.squeeze(0); }
  if (img.shape[0] === 784) {
    let resizedImg = tf.image.resizeNearestNeighbor(img.reshape([28, 28, 1]), [224, 224]);
    await tf.browser.toPixels(resizedImg, canvas);
  } else {
    let resizedImg = tf.image.resizeNearestNeighbor(img, [224, 224]);
    await tf.browser.toPixels(resizedImg, canvas);
  }
}