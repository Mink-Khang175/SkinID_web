export function assetUrl(path) {
  return import.meta.env.DEV ? `/src/assets${path}` : path;
}

window.SKINID_ASSET_URL = assetUrl;
