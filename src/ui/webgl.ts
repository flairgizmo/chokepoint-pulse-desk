import { WebGLRenderer } from 'three';

function rendererName(renderer: WebGLRenderer): string {
  try {
    const gl = renderer.getContext();
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!ext) return '';
    return String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '');
  } catch {
    return '';
  }
}

/** True when we can see a software / VM GL stack. Unknown renderer is treated as software. */
export function isSoftwareRenderer(renderer: WebGLRenderer): boolean {
  const name = rendererName(renderer);
  if (!name) return true;
  return /swiftshader|llvmpipe|softpipe|software|microsoft basic render|virtualbox|mesa offscreen/i.test(
    name,
  );
}

/** Bloom's ReadPixels stalls freeze software GL. Only enable it on a named hardware GPU. */
export function canUseBloom(renderer: WebGLRenderer): boolean {
  const name = rendererName(renderer);
  if (!name) return false;
  return !/swiftshader|llvmpipe|softpipe|software|microsoft basic render|virtualbox|mesa offscreen/i.test(
    name,
  );
}

/**
 * Open a WebGL context even on software GL. `lite` means no bloom / no PMREM.
 * Returns null only when WebGL itself cannot start.
 */
export function probeWebGL(): { lite: boolean } | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  try {
    const renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      failIfMajorPerformanceCaveat: false,
    });
    const lite = isSoftwareRenderer(renderer);
    renderer.dispose();
    return { lite };
  } catch {
    return null;
  }
}
