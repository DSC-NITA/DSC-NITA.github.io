import * as THREE from "https://cdn.skypack.dev/three@0.124.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/FBXLoader";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/EffectComposer";
import Stats from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/libs/stats.module";
import { RenderPass } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/ShaderPass.js";
import gsap from "https://cdn.skypack.dev/gsap@3.6.0";
const calcAspect = (el) => el.clientWidth / el.clientHeight;
const getNormalizedMousePos = (e) => {
    return {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
    };
};
const gridIcosahedronTextureUrl = `https://i.loli.net/2021/03/09/1Cglerjx3yLauOo.jpg`;
const gridIcosahedronShapeVertexShader = `
// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
vec3 fade(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}

float cnoise(vec3 P){
    vec3 Pi0=floor(P);// Integer part for indexing
    vec3 Pi1=Pi0+vec3(1.);// Integer part + 1
    Pi0=mod(Pi0,289.);
    Pi1=mod(Pi1,289.);
    vec3 Pf0=fract(P);// Fractional part for interpolation
    vec3 Pf1=Pf0-vec3(1.);// Fractional part - 1.0
    vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
    vec4 iy=vec4(Pi0.yy,Pi1.yy);
    vec4 iz0=Pi0.zzzz;
    vec4 iz1=Pi1.zzzz;
    
    vec4 ixy=permute(permute(ix)+iy);
    vec4 ixy0=permute(ixy+iz0);
    vec4 ixy1=permute(ixy+iz1);
    
    vec4 gx0=ixy0/7.;
    vec4 gy0=fract(floor(gx0)/7.)-.5;
    gx0=fract(gx0);
    vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0);
    vec4 sz0=step(gz0,vec4(0.));
    gx0-=sz0*(step(0.,gx0)-.5);
    gy0-=sz0*(step(0.,gy0)-.5);
    
    vec4 gx1=ixy1/7.;
    vec4 gy1=fract(floor(gx1)/7.)-.5;
    gx1=fract(gx1);
    vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1);
    vec4 sz1=step(gz1,vec4(0.));
    gx1-=sz1*(step(0.,gx1)-.5);
    gy1-=sz1*(step(0.,gy1)-.5);
    
    vec3 g000=vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100=vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010=vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110=vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001=vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101=vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011=vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111=vec3(gx1.w,gy1.w,gz1.w);
    
    vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
    g000*=norm0.x;
    g010*=norm0.y;
    g100*=norm0.z;
    g110*=norm0.w;
    vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
    g001*=norm1.x;
    g011*=norm1.y;
    g101*=norm1.z;
    g111*=norm1.w;
    
    float n000=dot(g000,Pf0);
    float n100=dot(g100,vec3(Pf1.x,Pf0.yz));
    float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z));
    float n110=dot(g110,vec3(Pf1.xy,Pf0.z));
    float n001=dot(g001,vec3(Pf0.xy,Pf1.z));
    float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
    float n011=dot(g011,vec3(Pf0.x,Pf1.yz));
    float n111=dot(g111,Pf1);
    
    vec3 fade_xyz=fade(Pf0);
    vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
    vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);
    float n_xyz=mix(n_yz.x,n_yz.y,fade_xyz.x);
    return 2.2*n_xyz;
}

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEyeVector;

uniform float uNoiseDensity;

// https://tympanus.net/codrops/2019/10/29/real-time-multiside-refraction-in-three-steps/
vec3 getEyeVector(){
    vec4 worldPosition=modelMatrix*vec4(position,1.);
    vec3 eyeVector=normalize(worldPosition.xyz-cameraPosition);
    return eyeVector;
}

void main(){
    vec3 noise=pow(cnoise(normal),3.)*normal*uNoiseDensity;
    vec3 newPosition=position+noise;
    vec4 modelPosition=modelMatrix*vec4(newPosition,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vNormal=normalize(normalMatrix*normal);
    vEyeVector=getEyeVector();
}
`;
const gridIcosahedronShapeFragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uRefractionStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vEyeVector;

// https://community.khronos.org/t/getting-the-normal-with-dfdx-and-dfdy/70177
vec3 computeNormal(vec3 normal){
    vec3 X=dFdx(normal);
    vec3 Y=dFdy(normal);
    vec3 cNormal=normalize(cross(X,Y));
    return cNormal;
}

// http://glslsandbox.com/e#47182.0
vec2 hash22(vec2 p){
    p=fract(p*vec2(5.3983,5.4427));
    p+=dot(p.yx,p.xy+vec2(21.5351,14.3137));
    return fract(vec2(p.x*p.y*95.4337,p.x*p.y*97.597));
}

// https://www.shadertoy.com/view/4scSW4
float fresnel(float bias,float scale,float power,vec3 I,vec3 N)
{
    return bias+scale*pow(1.+dot(I,N),power);
}

void main(){
    vec3 cNormal=computeNormal(vNormal);
    float diffuse=dot(cNormal,vec3(1.));
    vec2 rand=hash22(vec2(floor(diffuse*10.)));
    vec2 strength=vec2(sign((rand.x-.5))+(rand.x-.5)*.6,sign((rand.y-.5))+(rand.y-.5)*.6);
    vec2 uv=strength*gl_FragCoord.xy/vec2(1000.);
    vec3 refraction=uRefractionStrength*refract(vEyeVector,cNormal,1./3.);
    uv+=refraction.xy;
    vec4 color=texture2D(uTexture,uv);
    float F=fresnel(0.,1.,2.,vEyeVector,cNormal);
    color*=(1.-F);
    gl_FragColor=color;
}
`;
const gridIcosahedronEdgeVertexShader = `
// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
vec3 fade(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}

float cnoise(vec3 P){
    vec3 Pi0=floor(P);// Integer part for indexing
    vec3 Pi1=Pi0+vec3(1.);// Integer part + 1
    Pi0=mod(Pi0,289.);
    Pi1=mod(Pi1,289.);
    vec3 Pf0=fract(P);// Fractional part for interpolation
    vec3 Pf1=Pf0-vec3(1.);// Fractional part - 1.0
    vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);
    vec4 iy=vec4(Pi0.yy,Pi1.yy);
    vec4 iz0=Pi0.zzzz;
    vec4 iz1=Pi1.zzzz;
    
    vec4 ixy=permute(permute(ix)+iy);
    vec4 ixy0=permute(ixy+iz0);
    vec4 ixy1=permute(ixy+iz1);
    
    vec4 gx0=ixy0/7.;
    vec4 gy0=fract(floor(gx0)/7.)-.5;
    gx0=fract(gx0);
    vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0);
    vec4 sz0=step(gz0,vec4(0.));
    gx0-=sz0*(step(0.,gx0)-.5);
    gy0-=sz0*(step(0.,gy0)-.5);
    
    vec4 gx1=ixy1/7.;
    vec4 gy1=fract(floor(gx1)/7.)-.5;
    gx1=fract(gx1);
    vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1);
    vec4 sz1=step(gz1,vec4(0.));
    gx1-=sz1*(step(0.,gx1)-.5);
    gy1-=sz1*(step(0.,gy1)-.5);
    
    vec3 g000=vec3(gx0.x,gy0.x,gz0.x);
    vec3 g100=vec3(gx0.y,gy0.y,gz0.y);
    vec3 g010=vec3(gx0.z,gy0.z,gz0.z);
    vec3 g110=vec3(gx0.w,gy0.w,gz0.w);
    vec3 g001=vec3(gx1.x,gy1.x,gz1.x);
    vec3 g101=vec3(gx1.y,gy1.y,gz1.y);
    vec3 g011=vec3(gx1.z,gy1.z,gz1.z);
    vec3 g111=vec3(gx1.w,gy1.w,gz1.w);
    
    vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
    g000*=norm0.x;
    g010*=norm0.y;
    g100*=norm0.z;
    g110*=norm0.w;
    vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
    g001*=norm1.x;
    g011*=norm1.y;
    g101*=norm1.z;
    g111*=norm1.w;
    
    float n000=dot(g000,Pf0);
    float n100=dot(g100,vec3(Pf1.x,Pf0.yz));
    float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z));
    float n110=dot(g110,vec3(Pf1.xy,Pf0.z));
    float n001=dot(g001,vec3(Pf0.xy,Pf1.z));
    float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));
    float n011=dot(g011,vec3(Pf0.x,Pf1.yz));
    float n111=dot(g111,Pf1);
    
    vec3 fade_xyz=fade(Pf0);
    vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
    vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);
    float n_xyz=mix(n_yz.x,n_yz.y,fade_xyz.x);
    return 2.2*n_xyz;
}

varying vec2 vUv;
varying vec3 vCenter;

attribute vec3 aCenter;

uniform float uNoiseDensity;

void main(){
    vec3 noise=pow(cnoise(normal),3.)*normal*uNoiseDensity;
    vec3 newPosition=position+noise;
    vec4 modelPosition=modelMatrix*vec4(newPosition,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
    vCenter=aCenter;
}
`;
const gridIcosahedronEdgeFragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform float uWidth;

varying vec2 vUv;
varying vec3 vCenter;

// https://threejs.org/examples/?q=wire#webgl_materials_wireframe
float edgeFactorTri(){
    vec3 d=fwidth(vCenter);
    vec3 a3=smoothstep(d*(uWidth-.5),d*(uWidth+.5),vCenter);
    return min(min(a3.x,a3.y),a3.z);
}

float invert(float n){
    return 1.-n;
}

void main(){
    float line=invert(edgeFactorTri());
    if(line<.1){
        discard;
    }
    vec4 color=vec4(vec3(line),1.);
    gl_FragColor=color;
}
`;
const gridIcosahedronPostprocessingVertexShader = `
varying vec2 vUv;

void main(){
    vec4 modelPosition=modelMatrix*vec4(position,1.);
    vec4 viewPosition=viewMatrix*modelPosition;
    vec4 projectedPosition=projectionMatrix*viewPosition;
    gl_Position=projectedPosition;
    
    vUv=uv;
}
`;
const gridIcosahedronPostprocessingFragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D tDiffuse;
uniform float uRGBShift;

varying vec2 vUv;

// https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float hash(vec2 p){return fract(1e4*sin(17.*p.x+p.y*.1)*(.1+abs(sin(p.y*13.+p.x))));}

vec3 blackAndWhite(vec3 color){
    return vec3((color.r+color.g+color.b)/5.);
}

vec4 RGBShift(sampler2D t,vec2 rUv,vec2 gUv,vec2 bUv,float isBlackWhite){
    vec4 color1=texture2D(t,rUv);
    vec4 color2=texture2D(t,gUv);
    vec4 color3=texture2D(t,bUv);
    if(isBlackWhite==1.){
        color1.rgb=blackAndWhite(color1.rgb);
        color2.rgb=blackAndWhite(color2.rgb);
        color3.rgb=blackAndWhite(color3.rgb);
    }
    vec4 color=vec4(color1.r,color2.g,color3.b,1.);
    return color;
}

void main(){
    float noise=hash(vUv+uTime)*.1;
    vec2 rUv=vUv+vec2(.01)*uRGBShift;
    vec2 gUv=vUv+vec2(0.);
    vec2 bUv=vUv+vec2(.01)*uRGBShift*-1.;
    vec4 color=RGBShift(tDiffuse,rUv,gUv,bUv,1.);
    color.rgb+=vec3(noise);
    gl_FragColor=color;
}
`;
class Base {
    constructor(sel, debug = false) {
        this.debug = debug;
        this.container = document.querySelector(sel);
        this.perspectiveCameraParams = {
            fov: 75,
            near: 0.1,
            far: 100
        };
        this.orthographicCameraParams = {
            zoom: 2,
            near: -100,
            far: 1000
        };
        this.cameraPosition = new THREE.Vector3(0, 3, 10);
        this.lookAtPosition = new THREE.Vector3(0, 0, 0);
        this.rendererParams = {
            outputEncoding: THREE.LinearEncoding,
            config: {
                alpha: true,
                antialias: true
            }
        };
        this.mousePos = new THREE.Vector2(0, 0);
    }
    // 初始化
    init() {
        this.createScene();
        this.createPerspectiveCamera();
        this.createRenderer();
        this.createMesh({});
        this.createLight();
        this.createOrbitControls();
        this.addListeners();
        this.setLoop();
    }
    // 创建场景
    createScene() {
        const scene = new THREE.Scene();
        if (this.debug) {
            scene.add(new THREE.AxesHelper());
            const stats = Stats();
            this.container.appendChild(stats.dom);
            this.stats = stats;
        }
        this.scene = scene;
    }
    // 创建透视相机
    createPerspectiveCamera() {
        const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
        const { fov, near, far } = perspectiveCameraParams;
        const aspect = calcAspect(this.container);
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    }
    // 创建正交相机
    createOrthographicCamera() {
        const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
        const { left, right, top, bottom, near, far } = orthographicCameraParams;
        const camera = new THREE.OrthographicCamera(left, right, top, bottom, near, far);
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    }
    // 更新正交相机参数
    updateOrthographicCameraParams() {
        const { container } = this;
        const { zoom, near, far } = this.orthographicCameraParams;
        const aspect = calcAspect(container);
        this.orthographicCameraParams = {
            left: -zoom * aspect,
            right: zoom * aspect,
            top: zoom,
            bottom: -zoom,
            near,
            far,
            zoom
        };
    }
    // 创建渲染
    createRenderer(useWebGL1 = false) {
        var _a;
        const { rendererParams } = this;
        const { outputEncoding, config } = rendererParams;
        const renderer = !useWebGL1
            ? new THREE.WebGLRenderer(config)
            : new THREE.WebGL1Renderer(config);
        renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        renderer.outputEncoding = outputEncoding;
        this.resizeRendererToDisplaySize();
        (_a = this.container) === null || _a === void 0 ? void 0 : _a.appendChild(renderer.domElement);
        this.renderer = renderer;
        this.renderer.setClearColor(0x000000, 0);
    }
    // 允许投影
    enableShadow() {
        this.renderer.shadowMap.enabled = true;
    }
    // 调整渲染器尺寸
    resizeRendererToDisplaySize() {
        const { renderer } = this;
        if (!renderer) {
            return;
        }
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const { clientWidth, clientHeight } = canvas;
        const width = (clientWidth * pixelRatio) | 0;
        const height = (clientHeight * pixelRatio) | 0;
        const isResizeNeeded = canvas.width !== width || canvas.height !== height;
        if (isResizeNeeded) {
            renderer.setSize(width, height, false);
        }
        return isResizeNeeded;
    }
    // 创建网格
    createMesh(meshObject, container = this.scene) {
        const { geometry = new THREE.BoxGeometry(1, 1, 1), material = new THREE.MeshStandardMaterial({
            color: new THREE.Color("#d9dfc8")
        }), position = new THREE.Vector3(0, 0, 0) } = meshObject;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        container.add(mesh);
        return mesh;
    }
    // 创建光源
    createLight() {
        const dirLight = new THREE.DirectionalLight(new THREE.Color("#ffffff"), 0.5);
        dirLight.position.set(0, 50, 0);
        this.scene.add(dirLight);
        const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
        this.scene.add(ambiLight);
    }
    // 创建轨道控制
    createOrbitControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        const { lookAtPosition } = this;
        controls.target.copy(lookAtPosition);
        controls.update();
        this.controls = controls;
    }
    // 监听事件
    addListeners() {
        this.onResize();
    }
    // 监听画面缩放
    onResize() {
        window.addEventListener("resize", (e) => {
            if (this.camera instanceof THREE.PerspectiveCamera) {
                const aspect = calcAspect(this.container);
                const camera = this.camera;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            }
            else if (this.camera instanceof THREE.OrthographicCamera) {
                this.updateOrthographicCameraParams();
                const camera = this.camera;
                const { left, right, top, bottom, near, far } = this.orthographicCameraParams;
                camera.left = left;
                camera.right = right;
                camera.top = top;
                camera.bottom = bottom;
                camera.near = near;
                camera.far = far;
                camera.updateProjectionMatrix();
            }
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }
    // 动画
    update() {
        console.log("animation");
    }
    // 渲染
    setLoop() {
        this.renderer.setAnimationLoop(() => {
            this.resizeRendererToDisplaySize();
            this.update();
            if (this.controls) {
                this.controls.update();
            }
            if (this.stats) {
                this.stats.update();
            }
            if (this.composer) {
                this.composer.render();
            }
            else {
                this.renderer.render(this.scene, this.camera);
            }
        });
    }
    // 创建文本
    createText(text = "", config, material = new THREE.MeshStandardMaterial({
        color: "#ffffff"
    })) {
        const geo = new THREE.TextGeometry(text, config);
        const mesh = new THREE.Mesh(geo, material);
        return mesh;
    }
    // 创建音效源
    createAudioSource() {
        const listener = new THREE.AudioListener();
        this.camera.add(listener);
        const sound = new THREE.Audio(listener);
        this.sound = sound;
    }
    // 加载音效
    loadAudio(url) {
        const loader = new THREE.AudioLoader();
        return new Promise((resolve) => {
            loader.load(url, (buffer) => {
                this.sound.setBuffer(buffer);
                resolve(buffer);
            });
        });
    }
    // 加载模型
    loadModel(url) {
        const loader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(url, (gltf) => {
                const model = gltf.scene;
                resolve(model);
            }, undefined, (err) => {
                console.log(err);
                reject();
            });
        });
    }
    // 加载FBX模型
    loadFBXModel(url) {
        const loader = new FBXLoader();
        return new Promise((resolve, reject) => {
            loader.load(url, (obj) => {
                resolve(obj);
            }, undefined, (err) => {
                console.log(err);
                reject();
            });
        });
    }
    // 加载字体
    loadFont(url) {
        const loader = new THREE.FontLoader();
        return new Promise((resolve) => {
            loader.load(url, (font) => {
                resolve(font);
            });
        });
    }
    // 创建点选模型
    createRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.trackMousePos();
    }
    // 追踪鼠标位置
    trackMousePos() {
        window.addEventListener("mousemove", (e) => {
            this.setMousePos(e);
        });
        window.addEventListener("mouseout", () => {
            this.clearMousePos();
        });
        window.addEventListener("mouseleave", () => {
            this.clearMousePos();
        });
        window.addEventListener("touchstart", (e) => {
            this.setMousePos(e.touches[0]);
        }, { passive: false });
        window.addEventListener("touchmove", (e) => {
            this.setMousePos(e.touches[0]);
        });
        window.addEventListener("touchend", () => {
            this.clearMousePos();
        });
    }
    // 设置鼠标位置
    setMousePos(e) {
        const { x, y } = getNormalizedMousePos(e);
        this.mousePos.x = x;
        this.mousePos.y = y;
    }
    // 清空鼠标位置
    clearMousePos() {
        this.mousePos.x = -100000;
        this.mousePos.y = -100000;
    }
    // 获取点击物
    getInterSects() {
        this.raycaster.setFromCamera(this.mousePos, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        return intersects;
    }
    // 选中点击物时
    onChooseIntersect(target) {
        const intersects = this.getInterSects();
        const intersect = intersects[0];
        if (!intersect || !intersect.face) {
            return null;
        }
        const { object } = intersect;
        return target === object ? intersect : null;
    }
}
class GridIcosahedron extends Base {
    constructor(sel, debug) {
        super(sel, debug);
        this.clock = new THREE.Clock();
        this.cameraPosition = new THREE.Vector3(0, 0, 2);
        this.params = {
            uNoiseDensity: 0
        };
        this.mouseSpeed = 0;
    }
    // 初始化
    init() {
        this.createScene();
        this.createPerspectiveCamera();
        this.createRenderer();
        this.createGridIcosahedronShapeMaterial();
        this.createGridIcosahedronEdgeMaterial();
        this.createIcoShape();
        this.createIcoEdge();
        this.createPostprocessingEffect();
        this.createLight();
        this.trackMouseSpeed();
        this.createOrbitControls();
        this.addListeners();
        this.setLoop();
    }
    // 创建图形材质
    createGridIcosahedronShapeMaterial() {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(gridIcosahedronTextureUrl);
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        const gridIcosahedronShapeMaterial = new THREE.ShaderMaterial({
            vertexShader: gridIcosahedronShapeVertexShader,
            fragmentShader: gridIcosahedronShapeFragmentShader,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new THREE.Vector2(0, 0)
                },
                uResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                },
                uTexture: {
                    value: texture
                },
                uRefractionStrength: {
                    value: 0.2
                },
                uNoiseDensity: {
                    value: this.params.uNoiseDensity
                }
            }
        });
        this.gridIcosahedronShapeMaterial = gridIcosahedronShapeMaterial;
    }
    // 创建边框材质
    createGridIcosahedronEdgeMaterial() {
        const gridIcosahedronEdgeMaterial = new THREE.ShaderMaterial({
            vertexShader: gridIcosahedronEdgeVertexShader,
            fragmentShader: gridIcosahedronEdgeFragmentShader,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new THREE.Vector2(0, 0)
                },
                uResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                },
                uWidth: {
                    value: 2
                },
                uNoiseDensity: {
                    value: this.params.uNoiseDensity
                }
            }
        });
        this.gridIcosahedronEdgeMaterial = gridIcosahedronEdgeMaterial;
    }
    // 创建二十面体图形
    createIcoShape() {
        const geometry = new THREE.IcosahedronBufferGeometry(1, 1);
        const material = this.gridIcosahedronShapeMaterial;
        this.createMesh({
            geometry,
            material
        });
    }
    // 创建二十面体边框
    createIcoEdge() {
        const geometry = new THREE.IcosahedronBufferGeometry(1.001, 1);
        this.getBaryCoord(geometry);
        const material = this.gridIcosahedronEdgeMaterial;
        this.createMesh({
            geometry,
            material
        });
    }
    // 获取重心坐标系
    getBaryCoord(bufferGeometry) {
        // https://gist.github.com/mattdesl/e399418558b2b52b58f5edeafea3c16c
        const length = bufferGeometry.attributes.position.array.length;
        const count = length / 3;
        const bary = [];
        for (let i = 0; i < count; i++) {
            bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
        }
        const aCenter = new Float32Array(bary);
        bufferGeometry.setAttribute("aCenter", new THREE.BufferAttribute(aCenter, 3));
    }
    // 创建后期处理特效
    createPostprocessingEffect() {
        const composer = new EffectComposer(this.renderer);
        const renderPass = new RenderPass(this.scene, this.camera);
        composer.addPass(renderPass);
        const customPass = new ShaderPass({
            vertexShader: gridIcosahedronPostprocessingVertexShader,
            fragmentShader: gridIcosahedronPostprocessingFragmentShader,
            uniforms: {
                tDiffuse: {
                    value: null
                },
                uTime: {
                    value: 0
                },
                uRGBShift: {
                    value: 0.3
                }
            }
        });
        customPass.renderToScreen = true;
        composer.addPass(customPass);
        this.composer = composer;
        this.customPass = customPass;
    }
    // 动画
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        const mousePos = this.mousePos;
        const mouseSpeed = this.mouseSpeed * 5;
        if (this.gridIcosahedronShapeMaterial) {
            this.gridIcosahedronShapeMaterial.uniforms.uTime.value = elapsedTime;
            this.gridIcosahedronShapeMaterial.uniforms.uMouse.value = mousePos;
            this.scene.rotation.x = elapsedTime / 15;
            this.scene.rotation.y = elapsedTime / 15;
            gsap.to(this.gridIcosahedronShapeMaterial.uniforms.uNoiseDensity, {
                value: mouseSpeed,
                duration: 2
            });
            gsap.to(this.gridIcosahedronEdgeMaterial.uniforms.uNoiseDensity, {
                value: mouseSpeed,
                duration: 2
            });
        }
        if (this.customPass) {
            this.customPass.uniforms.uTime.value = elapsedTime;
            gsap.to(this.customPass.uniforms.uRGBShift, {
                value: mouseSpeed / 10,
                duration: 2
            });
        }
    }
    // 追踪鼠标速度
    trackMouseSpeed() {
        // https://stackoverflow.com/questions/6417036/track-mouse-speed-with-js
        let lastMouseX = -1;
        let lastMouseY = -1;
        let mouseSpeed = 0;
        window.addEventListener("mousemove", (e) => {
            const mousex = e.pageX;
            const mousey = e.pageY;
            if (lastMouseX > -1) {
                mouseSpeed = Math.max(Math.abs(mousex - lastMouseX), Math.abs(mousey - lastMouseY));
                this.mouseSpeed = mouseSpeed / 100;
            }
            lastMouseX = mousex;
            lastMouseY = mousey;
        });
        document.addEventListener("mouseleave", () => {
            this.mouseSpeed = 0;
        });
    }
}
const start = () => {
    const gridIcosahedron = new GridIcosahedron(".grid-icosahedron", false);
    gridIcosahedron.init();
};
start();