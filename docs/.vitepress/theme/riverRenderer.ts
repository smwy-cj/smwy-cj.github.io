import { riverLine, sceneCover } from './riverGeometry'
const vertex = `attribute vec2 a_position; varying vec2 v_uv;
void main(){v_uv=vec2(a_position.x*.5+.5,.5-a_position.y*.5);gl_Position=vec4(a_position,0.,1.);}`
const riverFunction = riverLine.slice(1).map((b, i) => {
  const a = riverLine[i]
  return `if(x<=${b[0].toFixed(3)})return mix(${a[1].toFixed(3)},${b[1].toFixed(3)},smoothstep(${a[0].toFixed(3)},${b[0].toFixed(3)},x));`
}).join('\n')
const fragment = `precision mediump float;
varying vec2 v_uv; uniform sampler2D u_image; uniform vec2 u_cover,u_pointer;
uniform float u_time,u_reveal,u_motion;
float river(float x){${riverFunction}return .07;}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
void main(){
 vec2 uv=(v_uv-.5)*u_cover+.5;
 float water=1.-smoothstep(.025,.105,abs(uv.y-river(uv.x)));
 vec2 bankDrift=vec2(sin(u_time*.12),cos(u_time*.09))*.0025;
 uv+=(u_pointer*.003+bankDrift)*(1.-water)*u_motion;
 float turbulence=noise(uv*32.+vec2(u_time*.25,-u_time*.2));
 vec2 ripple=vec2(sin(uv.y*85.+u_time*1.7),cos(uv.x*74.-u_time*1.4))*.0018;
 float phase=fract(u_time*.09),phaseB=fract(phase+.5);
 vec2 flow=vec2(.035,-.025)*u_motion;
 vec2 base=uv+ripple*water*u_motion*(.5+turbulence);
 vec3 still=texture2D(u_image,clamp(uv,.001,.999)).rgb;
 vec3 a=texture2D(u_image,clamp(base+flow*phase,.001,.999)).rgb;
 vec3 b=texture2D(u_image,clamp(base+flow*phaseB,.001,.999)).rgb;
 vec3 color=mix(still,mix(a,b,abs(phase*2.-1.)),water*.9*u_motion);
 float front=length(vec2(v_uv.x*.95,(1.-v_uv.y)*.8));
 float edge=noise(v_uv*18.)*.055+noise(v_uv*45.)*.02;
 float reveal=1.-smoothstep(u_reveal*1.48-.045,u_reveal*1.48+.035,front+edge);
 if(u_reveal>=.999)reveal=1.;
 gl_FragColor=vec4(mix(vec3(.015,.023,.023),color,reveal),1.);
}`
export function createRiverRenderer(canvas: HTMLCanvasElement, source: HTMLImageElement) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, preserveDrawingBuffer: true })
  if (!gl) return null
  const compile = (type: number, code: string) => {
    const shader = gl.createShader(type)!
    gl.shaderSource(shader, code); gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); throw new Error('River shader unavailable') }
    return shader
  }
  let program: WebGLProgram | null = null, texture: WebGLTexture | null = null, buffer: WebGLBuffer | null = null
  try {
    const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment)
    program = gl.createProgram()!; gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program)
    gl.deleteShader(vs); gl.deleteShader(fs)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('River program unavailable')
    gl.useProgram(program)
    buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
    const uniforms = Object.fromEntries(['time','reveal','motion','cover','pointer'].map(n => [n, gl.getUniformLocation(program!, `u_${n}`)]))
    return {
      draw(time: number, reveal: number, moving: boolean, px: number, py: number, width: number, height: number) {
        const cover = sceneCover(width, height)
        gl.viewport(0, 0, canvas.width, canvas.height)
        gl.uniform1f(uniforms.time, time); gl.uniform1f(uniforms.reveal, reveal); gl.uniform1f(uniforms.motion, moving ? 1 : 0)
        gl.uniform2f(uniforms.cover, cover.x, cover.y); gl.uniform2f(uniforms.pointer, px, py)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
      },
      dispose() { gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program) }
    }
  } catch {
    gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program)
    return null
  }
}
