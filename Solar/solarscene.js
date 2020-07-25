let globalsize = .01;
let globaldistance = 8;

let renderer = null,
    scene = null,
    camera = null,
    sunGroup = null,
    sun = null,
    celestials = [
        mercury = {
            group: null,
            distance: .39,
            url: "../images/2k_mercury.jpg",
            size: .38,
            celestial: null,
            speed: 47.87,
            moons: 0,
            moonArray:[]

        },
        venus = {
            group: null,
            distance: .72,
            url: "../images/2k_venus_surface.jpg",
            size: .95,
            celestial: null,
            speed: 35.02,
            moons: 0,
            moonArray: []
        },
        earth = {
            group: null,
            distance: 1,
            url: "../images/earth_atmos_2048.jpg",
            size: 1,
            celestial: null,
            speed: 29.78,
            moons: 1,
            moonArray: []
        },
        mars = {
            group: null,
            distance: 1.524,
            url: "../images/2k_mars.jpg",
            size: .53,
            celestial: null,
            speed: 24.077,
            moons: 2,
            moonArray: []
        },
        jupiter = {
            group: null,
            distance: 5.203,
            url: "../images/2k_jupiter.jpg",
            size: 11.2,
            celestial: null,
            speed: 13.07,
            moons: 79,
            moonArray: []
        },
        saturn = {
            group: null,
            distance: 9.539,
            url: "../images/2k_saturn.jpg",
            size: 9.54,
            celestial: null,
            speed: 9.69,
            moons: 82,
            moonArray: []
        },
        uranus = {
            group: null,
            distance: 19.18,
            url: "../images/2k_uranus.jpg",
            size: 4,
            celestial: null,
            speed: 6.81,
            moons: 27,
            moonArray: []
        },
        neptune = {
            group: null,
            distance: 30.06,
            url: "../images/2k_neptune.jpg",
            size: 3.88,
            celestial: null,
            speed: 5.43,
            moons: 14,
            moonArray: []
        },
        pluto = {
            group: null,
            distance: 39.53,
            url: "../images/plutomap1k.jpg",
            size: .185,
            celestial: null,
            speed: 4.74,
            moons: 5,
            moonArray: []
        }
    ],
    moon = {
        group: null,
        distance: .39,
        url: "../images/moon_1024.jpg",
        size: .27,
        celestial: null,
        speed: null
    };

let duration = 5000; // ms
let currentTime = Date.now();

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    //sun
    sunGroup.rotation.y -= angle / 2;
    sun.rotation.x += angle;

    //planets
    celestials.forEach(planet => {
        planet.group.rotation.y -= angle / 2 * (planet.speed / 25);
        planet.celestial.rotation.x += angle;
        planet.moonArray.forEach(moon => {
            moon.rotation.y -= angle / 2 * (planet.speed / 25);
            moon.rotation.x += angle;
        });

    });
}

function run() {
    requestAnimationFrame(function () {
        run();
    });
    renderer.render(scene, camera);

    //orbit Controls
    var orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
    orbitControls.enabled = true;
    orbitControls.enableZoom =true;
    orbitControls.enablePan = true;
    orbitControls.autoRotate = true;
    orbitControls.enableKeys = true;
    orbitControls.panSpeed = 0.005;
    orbitControls.zoomSpeed = 0.05;
    orbitControls.rotateSpped = 0.005;
    orbitControls.keyPanSpeed = 0.005;
    orbitControls.maxZoom = 2.0;
    animate(orbitControls); 
}

function createScene(canvas) {
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setSize(canvas.width, canvas.height);
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.position.z = 50;
    camera.position.y = 15;

    scene.add(camera);
    let light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(-.5, .2, 1);
    light.target.position.set(0, -2, 0);
    scene.add(light);
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    const loader = new THREE.TextureLoader();
    loader.load('../images/2k_stars.jpg', function (texture) {
        scene.background = texture;
    });

    createCelestials();
    scene.add(sunGroup);
    //addMouseHandler(canvas, sunGroup);
}


function createCelestials() {

    //sun{size:109, distance:0} 
    sunGroup = new THREE.Object3D;
    sunGroup.position.set(0, 0, 0);
    let textureUrl = "../images/2k_sun.jpg";
    let texture = new THREE.TextureLoader().load(textureUrl);
    let material = new THREE.MeshPhongMaterial({
        map: texture
    });
    //geometry = new THREE.SphereGeometry(169*globalsize, 20, 20);
    geometry = new THREE.SphereGeometry(1, 20, 20);
    sun = new THREE.Mesh(geometry, material);
    sunGroup.add(sun);

    celestials.forEach(planet => {
        createCelestial(planet)
    });

}

function createCelestial(planet) {
    planet.group = new THREE.Object3D;
    planet.group.position.set(0, 0, 0);
    let textureUrl = planet.url;
    let texture = new THREE.TextureLoader().load(textureUrl);
    let material = new THREE.MeshPhongMaterial({
        map: texture
    });
    //let geometry = new THREE.SphereGeometry(planet.size*globalsize, 20, 20);
    let geometry = new THREE.SphereGeometry(.5, 20, 20);
    planet.celestial = new THREE.Mesh(geometry, material);
    planet.celestial.position.set(0, 0, planet.distance * globaldistance);
    planet.group.add(planet.celestial)
    sunGroup.add(planet.group);
    createMoons(planet);
    createRingtrayectory(planet);


}

function createMoons(planet) {
    let mon = null;
    mooncount = planet.moons;

    for (i = 0; i < mooncount; i++) 
    {
        rand1 = getRandomFloat(-1,1);
        rand2 = getRandomFloat(-1,1);
        rand3 = getRandomFloat(-1,1);
        let textureUrl = moon.url;
    let texture = new THREE.TextureLoader().load(textureUrl);
    let material = new THREE.MeshPhongMaterial({
        map: texture
    });
    let geometry = new THREE.SphereGeometry(.1, 20, 20);
    mon = new THREE.Mesh(geometry, material);
    planet.moonArray.push(mon);

    mon.position.set(rand1, rand2, rand3 + (planet.distance * globaldistance));
    planet.group.add(mon)
    }
}

function createRingtrayectory(planet)
{   
    let inner = (planet.distance * globaldistance);
    var geometry = new THREE.TorusGeometry(inner,.1,16,100);
    var material = new THREE.MeshBasicMaterial( { color: 0xffff00} );
    var torus = new THREE.Mesh( geometry, material );
    torus.rotation.x= Math.PI /2;
    scene.add( torus );
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }