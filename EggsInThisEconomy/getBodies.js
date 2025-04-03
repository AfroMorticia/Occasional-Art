import * as THREE from "three";

const sceneMiddle = new THREE.Vector3(0, 0, 0);

function getBody(RAPIER, world) {
    const size = 0.1 + Math.random() * 0.25;
    const range = 6;
    const density = size  * 1.0;
    let x = Math.random() * range - range * 0.5;
    let y = Math.random() * range - range * 0.5 + 3;
    let z = Math.random() * range - range * 0.5;
    // physics
    let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(x, y, z);
    let rigid = world.createRigidBody(rigidBodyDesc);
    let colliderDesc = RAPIER.ColliderDesc.ball(size).setDensity(density);
    world.createCollider(colliderDesc, rigid);
  
    const geometry = new THREE.IcosahedronGeometry(size, 2);
    const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        flatShading: true
    });
    const mesh = new THREE.Mesh(geometry, material);

    function animateWobble(t) {
      const position = geometry.attributes.position;
      for (let i = 0; i < position.count; i++) {
          const offset = Math.sin(t * 0.005 + i) * 0.02;
          position.array[i * 3] += offset;
          position.array[i * 3 + 1] += offset;
          position.array[i * 3 + 2] += offset;
      }
      position.needsUpdate = true;

      // Smooth color shifting effect
      const hue = Math.sin(t * 0.001 + size) * 0.5 + 0.5;
      material.color.setHSL(hue, 1, 0.5);
  }


  //wireframe effect
   
    
    function update (t) {
      rigid.resetForces(true); 
      let { x, y, z } = rigid.translation();
      let pos = new THREE.Vector3(x, y, z);
      let dir = pos.clone().sub(sceneMiddle).normalize();
      rigid.addForce(dir.multiplyScalar(-0.5), true);
      mesh.position.set(x, y, z);

      
    }
    return { mesh, rigid, update };
  }

  function getMouseBall (RAPIER, world) {
    const mouseSize = 0.25;
    const geometry = new THREE.IcosahedronGeometry(mouseSize, 8);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
    });
    const mouseLight = new THREE.PointLight(0xffffff, 1);
    const mouseMesh = new THREE.Mesh(geometry, material);
    mouseMesh.add(mouseLight);
    // RIGID BODY
    let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0, 0)
    let mouseRigid = world.createRigidBody(bodyDesc);
    let dynamicCollider = RAPIER.ColliderDesc.ball(mouseSize * 3.0);
    world.createCollider(dynamicCollider, mouseRigid);
    function update (mousePos) {
      mouseRigid.setTranslation({ x: mousePos.x * 5, y: mousePos.y * 5, z: 0.2 });
      let { x, y, z } = mouseRigid.translation();
      mouseMesh.position.set(x, y, z);
    }
    return { mesh: mouseMesh, update };
  }

  export { getBody, getMouseBall };