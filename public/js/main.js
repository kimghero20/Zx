import * as THREE from 'https://cdn.skypack.dev/three';

let camera, scene, renderer;
let player, joystick, nicknameLabel;
let nickname = "Player";
let isFemale = false;
let velocity = new THREE.Vector3();
let objects = [];

document.getElementById("startBtn").onclick = () => {
  nickname = document.getElementById("nickname").value || "Player";
  isFemale = document.querySelector('input[name="character"]:checked').value === "female";
  document.getElementById("loginScreen").style.display = "none";
  initGame();
};

function initGame() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
  scene.add(light);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x66aa66 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  for (let x = -50; x <= 50; x += 5) {
    addFence(x, 50);
    addFence(x, -50);
    addFence(50, x, true);
    addFence(-50, x, true);
  }

  const house = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  house.position.set(0, 5, 0);
  scene.add(house);

  const playerColor = isFemale ? 0xff69b4 : 0x3399ff;
  player = new THREE.Mesh(
    new THREE.BoxGeometry(2, 4, 2),
    new THREE.MeshStandardMaterial({ color: playerColor })
  );
  player.position.set(0, 2, 30);
  scene.add(player);

  camera.position.set(0, 10, 15);
  camera.lookAt(player.position);

  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.color = 'white';
  div.style.fontSize = '14px';
  div.innerText = nickname;
  document.body.appendChild(div);
  nicknameLabel = div;

  initJoystick();
  animate();
}

function addFence(x, z, vertical = false) {
  const fence = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  );
  fence.position.set(x, 1, z);
  scene.add(fence);
  objects.push(fence);
}

function initJoystick() {
  const joystickZone = document.getElementById('joystickContainer');
  const manager = nipplejs.create({
    zone: joystickZone,
    mode: 'static',
    position: { left: '50px', bottom: '50px' },
    color: 'white'
  });

  manager.on('move', (evt, data) => {
    if (!data || !data.angle) return;
    const angle = data.angle.degree;
    const distance = data.distance / 20;
    const rad = angle * (Math.PI / 180);

    // Global koordinata göre hareket (sabit yönler)
    velocity.x = Math.cos(rad) * distance;
    velocity.z = Math.sin(rad) * distance;
  });

  manager.on('end', () => velocity.set(0, 0, 0));
}

function animate() {
  requestAnimationFrame(animate);
  player.position.add(velocity);
  camera.position.lerp(
    new THREE.Vector3(player.position.x, player.position.y + 6, player.position.z + 12),
    0.1
  );
  camera.lookAt(player.position);

  const vector = player.position.clone().project(camera);
  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;
  nicknameLabel.style.left = `${x}px`;
  nicknameLabel.style.top = `${y - 40}px`;

  renderer.render(scene, camera);
}