/**
 * 推广创作台 · 卡片图尺寸表
 *
 * 尺寸值一律是**逻辑尺寸（1x）**：海报引擎按这个尺寸画布，
 * 真实分辨率由 `PosterRequest.scale` 放大（scale=2 时 540×960 → 1080×1920）。
 * 这样排版代码只需要维护一套坐标，不会出现"改了一个尺寸、其他尺寸全错位"。
 *
 * 选型依据：小红书/抖音/快手主图 9:16、视频封面 16:9、朋友圈九宫格 1:1、
 * 资讯配图 4:3、二手平台商品图 3:4——都是各平台目前上传不被裁切的原始比例。
 */
import type { PosterSize, PosterSizeId } from './types';

/** 入参非法时的兜底尺寸：9:16 是运营使用频率最高的一档 */
const FALLBACK_SIZE_ID: PosterSizeId = '9:16';

/**
 * 全部出图尺寸。
 *
 * 顺序即界面展示顺序：把主尺寸 9:16 放第一位，运营默认就能点到。
 */
export const POSTER_SIZES: PosterSize[] = [
  {
    id: '9:16',
    label: '9:16 竖版',
    width: 540,
    height: 960,
    usage: '小红书/抖音/快手主图、朋友圈长图',
  },
  {
    id: '16:9',
    label: '16:9 横版',
    width: 960,
    height: 540,
    usage: '视频封面、公众号头图、B站封面',
  },
  {
    id: '1:1',
    label: '1:1 方图',
    width: 640,
    height: 640,
    usage: '朋友圈九宫格、商品主图',
  },
  {
    id: '4:3',
    label: '4:3 横图',
    width: 800,
    height: 600,
    usage: '资讯配图、微博配图',
  },
  {
    id: '3:4',
    label: '3:4 竖图',
    width: 600,
    height: 800,
    usage: '小红书次图、闲鱼/转转商品图',
  },
];

/**
 * 按 id 取尺寸定义。
 *
 * @param id - 尺寸 id；允许传入任意字符串（例如来自 URL 参数的脏值）。
 * @returns 命中的尺寸定义；未命中时返回 9:16 竖版，调用方无需判空。
 */
export function getPosterSize(id: string | null | undefined): PosterSize {
  const matched = POSTER_SIZES.find((size) => size.id === id);
  if (matched) return matched;
  const fallback = POSTER_SIZES.find((size) => size.id === FALLBACK_SIZE_ID);
  // POSTER_SIZES 非空且第一项恒存在，这里的兜底只为满足类型收窄
  return fallback ?? POSTER_SIZES[0];
}
