import './style.css'

import * as THREE from 'three';

import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight,0.1,1000);
const renderer = new THREE.WebGLRenderer({
  canvas  : document.querySelector('#bg'),
});  

//JSON containing all the answers
const answersarr = JSON.parse('["Without a doubt.","Absolutely.","Yes, of course.","100%.","Yes.","Try again.","Ask again later.","Who knows?.","I am not 100% sure.","I do not really know.","It is not certain.","Certainly no.","Probably not.","No.","There is a 0% chance." ]');

//HTML elements
const askbtn = document.getElementById('AskButton') as HTMLButtonElement;
const question = document.getElementById('question-input') as HTMLInputElement;
const answer = document.getElementById('answer');

//Model Variables
const gltfLoader = new GLTFLoader();
let mixer: THREE.AnimationMixer;
let clips;
let action: THREE.AnimationAction;
var eightball;

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth,window.innerHeight);

camera.position.setZ(2);
camera.position.setX(1);
camera.position.setY(-1);

renderer.render(scene,camera);

askbtn!.disabled = true;
question!.value = "";


gltfLoader.load(
  './src/Models/8ball.gltf',
  function(gltf: { scene: any; animations: any; }){
    eightball = gltf.scene;
    scene.add(eightball);
    clips = gltf.animations;
    mixer = new THREE.AnimationMixer(eightball);
    const clip = THREE.AnimationClip.findByName(clips,'SphereAction');
    action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1);
  },
  function(xhr: { loader: number; total: number; }){
    console.log((xhr.loader/xhr.total*100) + '% loaded');
  },
  function(error: any){
    console.log('Error loading model');
  },
)

const pointLight = new THREE.PointLight(0xa20064);
pointLight.position.set(20,10,20);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight,ambientLight);

const controls = new OrbitControls(camera,renderer.domElement);

const loader = new THREE.TextureLoader();
scene.background = loader.load('./src/Images/background.jpg');

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
    question!.readOnly = false;
    answer!.style.opacity = '1';
    action.reset();
    action.enabled = false;
  })
  mixer.update(clock.getDelta());
}


askbtn?.addEventListener('click',function handleClick(){
  if(question!.value != "0")
  {
    question!.readOnly = true;
    answer!.style.opacity = '0';
    askbtn.disabled = true;
    question!.value = "";
    action.enabled = true;
    let randomanswer = Math.floor(Math.random() * 14);
    answer!.innerHTML = answersarr[randomanswer];
    playAnimation();
  }
})

//Disables button if input is empty.
question?.addEventListener('keyup',function()
{
  if(this.value.length > 0)
  {
    askbtn!.disabled = false;
  }
  else
  {
    askbtn!.disabled = true;
  }
})

//Properly updates the aspect ratio and size of the contents of the window. 
window.addEventListener('resize', function()
{
  var width = window.innerWidth;
  var height = window.innerHeight;
  renderer.setSize(width,height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});
renderBall();
