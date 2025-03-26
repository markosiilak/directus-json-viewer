import { definePanel } from '@directus/extensions-sdk';

export default definePanel({
  id: 'json-viewer',
  name: 'Collection JSON Viewer',
  icon: 'code',
  description: 'View collection data as JSON',
  options: null,
  minWidth: 12,
  minHeight: 8,
  component: async () => {
    return {
      template: `
        <div class="json-viewer">
          <select v-model="selectedCollection" @change="fetchData">
            <option v-for="collection in collections" :value="collection">
              {{ collection }}
            </option>
          </select>
          <pre v-if="jsonData" class="json-display">{{ jsonData }}</pre>
        </div>
      `,
      data() {
        return {
          collections: [],
          selectedCollection: '',
          jsonData: null
        };
      },
      async created() {
        await this.getCollections();
      },
      methods: {
        async getCollections() {
          const response = await fetch('/collections');
          this.collections = await response.json();
        },
        async fetchData() {
          if (!this.selectedCollection) return;
          const response = await fetch(`/items/${this.selectedCollection}`);
          const data = await response.json();
          this.jsonData = JSON.stringify(data, null, 2);
        }
      },
      styles: `
        .json-viewer {
          padding: 20px;
        }
        .json-display {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
          overflow: auto;
        }
        select {
          width: 200px;
          padding: 8px;
          border-radius: 4px;
        }
      `
    };
  }
});
