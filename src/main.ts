import './style.css'

import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({
  canvas  : document.querySelector('#bg'),
});  
const startbtn = document.getElementById('StartButton');
const answer = document.getElementById('answer');
const answersarr = JSON.parse('["Without a doubt.","Absolutely.","Yes, of course.","100%.","Yes.","Try again.","Ask again later.","Who knows?.","I am not 100% sure.","I do not really know.","It is not certain.","Certainly no.","Probably not.","No.","There is a 0% chance." ]');

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth,window.innerHeight);

camera.position.setZ(2);
camera.position.setX(2);
camera.position.setY(-1);

renderer.render(scene,camera);

window.addEventListener('resize', function()
{
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width,height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

const gltfLoader = new GLTFLoader();
let mixer: THREE.AnimationMixer;
var eightball;
let clips;
let action: THREE.AnimationAction;
gltfLoader.load(
  './src/Models/8ball.gltf',
  function(gltf){
    eightball = gltf.scene;
    scene.add(eightball);
    clips = gltf.animations;
    mixer = new THREE.AnimationMixer(eightball);
    const clip = THREE.AnimationClip.findByName(clips,'SphereAction');
    action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1);
  },
  function(xhr){
    console.log((xhr.loader/xhr.total*100) + '% loaded');
  },
  function(error){
    console.log('Error loading model');
  },
)

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(30,20,20);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight,ambientLight);

const controls = new OrbitControls(camera,renderer.domElement);

const loader = new THREE.TextureLoader();
scene.background = loader.load('./src/Images/space.jpg');

const clock = new THREE.Clock();

function renderBall()
{
  requestAnimationFrame(renderBall);
  controls.update();
  renderer.render(scene , camera);
}

function playAnimation()
{
  action.play();
  requestAnimationFrame(playAnimation);
  mixer.addEventListener('finished',function()
  {
    answer!.style.opacity = '1';
    action.reset();
    action.enabled = false;
  })
  mixer.update(clock.getDelta());
}

startbtn?.addEventListener('click',function handleClick(){
  action.enabled = true;
  let randomanswer = Math.floor(Math.random() * 14);
  console.log(answersarr[randomanswer]);
  answer!.innerHTML = answersarr[randomanswer];
  playAnimation();
})

renderBall();