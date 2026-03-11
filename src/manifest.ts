export default{
  background: {
    scripts: [
      "browser-polyfill.js"
    ],
    service_worker: [
      "background.js"
    ]
  },
  content_scripts: [
    {
      matches: ["https://my.tyuiu.ru/schedule?group=*"],
      js: ["content.js"]
    }
  ],
  action: { default_popup: "popup.html" },
  browser_specific_settings: {
    gecko: {
      id: "tyuiubility@incerstyle.ru",
      strict_min_version: "109.0",
      data_collection_permissions: []
    }
  }
}