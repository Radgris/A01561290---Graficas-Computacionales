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
            celestial: null
        },
        venus = {
            group: null,
            distance: .72,
            url: "../images/2k_venus_surface.jpg",
            size: .95,
            celestial: null
        },
        earth = {
            group: null,
            distance: 1,
            url: "../images/earth_atmos_2048.jpg",
            size: 1,
            celestial: null
        },
        mars = {
            group: null,
            distance: 1.524,
            url: "../images/2k_mars.jpg",
            size: .53,
            celestial: null
        },
        jupiter = {
            group: null,
            distance: 5.203,
            url: "../images/2k_jupiter.jpg",
            size: 11.2,
            celestial: null
        },
        saturn = {
            group: null,
            distance: 9.539,
            url: "../images/2k_saturn.jpg",
            size: 9.54,
            celestial: null
        },
        uranus = {
            group: null,
            distance: 19.18,
            url: "../images/2k_uranus.jpg",
            size: 4,
            celestial: null
        },
        neptune = {
            group: null,
            distance: 30.06,
            url: "../images/2k_neptune.jpg",
            size: 3.88,
            celestial: null
        },
        pluto = {
            group: null,
            distance: 39.53,
            url: "../images/plutomap1k.jpg",
            size: .185,
            celestial: null
        }
    ],
    moon = {
        group: null,
        distance: .39,
        url: "../images/moon_1024.jpg",
        size: .27,
        celestial: null
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
        planet.celestial.rotation.y -= angle / 2;
        planet.celestial.rotation.x += angle;

    });
}

function run() {
    requestAnimationFrame(function () {
        run();
    });
    renderer.render(scene, camera);
    animate();
}

function createScene(canvas) {
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setSize(canvas.width, canvas.height);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0.2, 0.2, 0.2);
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.position.z = 10;
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
    addMouseHandler(canvas, sunGroup);
}


function createCelestials() {

    //sun{size:109, distance:0} 
    sunGroup = new THREE.Object3D;
    sunGroup.position.set(0, 0, -4);
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
    planet.group.position.set(0, 0, planet.distance * globaldistance);
    let textureUrl = planet.url;
    let texture = new THREE.TextureLoader().load(textureUrl);
    let material = new THREE.MeshPhongMaterial({
        map: texture
    });
    //let geometry = new THREE.SphereGeometry(planet.size*globalsize, 20, 20);
    let geometry = new THREE.SphereGeometry(.5, 20, 20);
    planet.celestial = new THREE.Mesh(geometry, material);
    planet.group.add(planet.celestial)
    sunGroup.add(planet.group);
}