import { ShaderMaterial, UniformsUtils } from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';

export class TexturePass extends Pass {
  constructor(texture) {
    super();
    this.clear = true;
    this.texture = texture;
    this.uniforms = UniformsUtils.clone(CopyShader.uniforms);
    this.uniforms.tDiffuse.value = texture;
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: CopyShader.vertexShader,
      fragmentShader: CopyShader.fragmentShader,
    });
    this._fsQuad = new FullScreenQuad(this.material);
  }

  render(renderer, writeBuffer) {
    this.uniforms.tDiffuse.value = this.texture;
    renderer.setRenderTarget(writeBuffer);
    if (this.clear) renderer.clear();
    this._fsQuad.render(renderer);
  }

  dispose() {
    this.material.dispose();
    this._fsQuad.dispose();
  }
}
