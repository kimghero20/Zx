const socket = io();
let scene, camera, renderer, player;
let joystick, joystickData = {x:0, y:0};
let players = {};

document.getElementById('girlBtn').onclick = ()=> chosenColor=0xff69b4;
document.getElementById('boyBtn').onclick = ()=> chosenColor=0x3399ff;
let chosenColor = 0x3399ff;

document.getElementById('startBtn').onclick = ()=>{
  const nick = document.getElementById('nickname').value||'Player';
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('chatToggleBtn').style.display='block';
  init();
  animate();
  socket.emit('newPlayer',{x:0,z:0,color:chosenColor,nickname:nick});
};

document.getElementById('chatToggleBtn').onclick=()=>{
  const cb=document.getElementById('chatBox');
  cb.style.display=cb.style.display==='none'?'block':'none';
};

document.getElementById('chatInput').addEventListener('keypress',e=>{
  if(e.key==='Enter')socket.emit('chat',e.target.value),e.target.value='';
});

socket.on('players',data=>{
  Object.values(players).forEach(p=>scene.remove(p));
  players={};
  for(let id in data){
    const d=data[id];
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(1,2,1),new THREE.MeshStandardMaterial({color:d.color}));
    mesh.position.set(d.x,1,d.z);
    scene.add(mesh);
    players[id]=mesh;
  }
});

socket.on('chat',d=>{
  const m=document.createElement('div');
  m.textContent=`${d.nickname}: ${d.message}`;
  document.getElementById('chatMessages').appendChild(m);
});

function setupJoystick(){
  joystick = nipplejs.create({zone:document.getElementById('joystickZone'),mode:'static',position:{left:'75px',bottom:'75px'},color:'white'});
  joystick.on('move',(evt, data)=>{
    joystickData.x = data.vector.x;
    joystickData.y = data.vector.y;
  });
  joystick.on('end',()=> joystickData={x:0,y:0});
}

function init(){
  scene=new THREE.Scene();
  camera=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
  renderer=new THREE.WebGLRenderer({canvas:document.getElementById('gameCanvas')});
  renderer.setSize(window.innerWidth,window.innerHeight);
  camera.position.set(0,5,10);
  const light=new THREE.HemisphereLight(0xffffff,0x444444);
  scene.add(light);

  const ground=new THREE.Mesh(new THREE.PlaneGeometry(50,50),new THREE.MeshStandardMaterial({color:0x228822}));
  ground.rotation.x=-Math.PI/2;scene.add(ground);

  // house
  const house=new THREE.Mesh(new THREE.BoxGeometry(4,4,4),new THREE.MeshStandardMaterial({color:0x888888}));
  house.position.set(5,2,0);scene.add(house);
  // fences
  for(let i=-5;i<=5;i+=2){
    let f=new THREE.Mesh(new THREE.BoxGeometry(0.2,1,1),new THREE.MeshStandardMaterial({color:0x8B4513}));
    f.position.set(i,0.5,5);scene.add(f);
    f=f.clone();f.position.set(i,0.5,-5);scene.add(f);
  }

  player=new THREE.Mesh(new THREE.BoxGeometry(1,2,1),new THREE.MeshStandardMaterial({color:chosenColor}));
  player.position.set(0,1,0);scene.add(player);
  setupJoystick();
}

function animate(){
  requestAnimationFrame(animate);
  const speed=0.1;
  const dir=new THREE.Vector3(joystickData.x,0,-joystickData.y).normalize().multiplyScalar(speed);
  player.position.add(dir); camera.position.add(dir); camera.lookAt(player.position);
  socket.emit('move',{x:player.position.x,z:player.position.z});
  renderer.render(scene,camera);
}

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);
});