/** 中心模型路径 — 改 SPINE_MODEL_KEY 即可切换，无需动 themes */
export const SPINE_MODELS = {
  /** 正式版：v0.3 虹彩脊椎 */
  spine: '/models/spine.glb',
  /** 预览：树桩 */
  treeStump: '/models/beautiful_tree_stump.glb',
};

/** 'spine' | 'treeStump' — 预览树桩时改为 'treeStump' */
export const SPINE_MODEL_KEY = 'spine';

export function getSpineModelPath(key = SPINE_MODEL_KEY) {
  return SPINE_MODELS[key] ?? SPINE_MODELS.spine;
}
