export default {
  patchManifest: (manifest: any) => {
    if (!manifest.browser_specific_settings) {
      manifest.browser_specific_settings = {}
    }

    manifest.browser_specific_settings.gecko = {
      id: "tyuiubility@incerstyle.ru",
      strict_min_version: "109.0",
      data_collection_permissions: []
    }

    return manifest
  }
}