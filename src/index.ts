import { definePanel } from "@directus/extensions-sdk"

import JsonViewerPanel from "./panel.vue"

export default definePanel({
  id: "json-viewer",
  name: "Collection JSON Viewer",
  icon: "code",
  description: "View collection data as JSON",
  component: JsonViewerPanel,
  options: null,
  minWidth: 12,
  minHeight: 8
})
