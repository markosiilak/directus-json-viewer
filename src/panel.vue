<template>
  <div class="json-viewer">
    <div class="title-container full mb-4"><h1 class="type-title">Directus JSON Viewer</h1></div>
    <v-select
      v-model="selectedCollection"
      :items="collections"
      placeholder="Select Collection"
      @update:model-value="fetchData" />

    <div v-if="availableFields.length" class="field-selector mt-4 mb-4">
      <v-expansion-panel>
        <v-expansion-panel-title>Include only selected fields</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div style="display: flex; flex-wrap: wrap; gap: 16px;">
            <v-checkbox
              v-for="field in availableFields"
              :key="field"
              v-model="selectedFields"
              :label="field"
              :value="field"
              @change="updateDisplayData" />
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </div>
    <v-checkbox
      v-model="showFirstItemOnly"
      label="Show only first item"
      class="mt-2"
      @change="updateDisplayData" />

    <v-card v-if="jsonData" class="mt-4">
      <v-card-text>
        <JsonViewer :value="displayData" :expand-depth="5" copyable sort />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
  import { useApi } from "@directus/extensions-sdk";
  import { computed, ref, watch } from "vue";
  import JsonViewer from "vue-json-viewer";

  const api = useApi();
  const collections = ref<Array<{ text: string; value: string }>>([]);
  const selectedCollection = ref<string>(localStorage.getItem("selectedCollection") || "");
  const jsonData = ref<any>(null);
  const showFirstItemOnly = ref<boolean>(localStorage.getItem("showFirstItemOnly") === "true");
  const availableFields = ref<string[]>([]);
  const selectedFields = ref<string[]>(JSON.parse(localStorage.getItem("selectedFields") || "[]"));

  watch(selectedFields, (newValue) => {
    localStorage.setItem("selectedFields", JSON.stringify(newValue));
  });

  const displayData = computed(() => {
    if (!jsonData.value) return null;

    let filteredData: any = jsonData.value;

    if (selectedFields.value.length > 0) {
      if (Array.isArray(filteredData)) {
        filteredData = filteredData.map((item: Record<string, any>) => {
          const filtered: Record<string, any> = {};
          selectedFields.value.forEach((field: string) => {
            if (Object.prototype.hasOwnProperty.call(item, field)) {
              filtered[field] = item[field];
            }
          });
          return filtered;
        });
      } else {
        const filtered: Record<string, any> = {};
        selectedFields.value.forEach((field: string) => {
          if (Object.prototype.hasOwnProperty.call(filteredData, field)) {
            filtered[field] = filteredData[field];
          }
        });
        filteredData = filtered;
      }
    }

    if (showFirstItemOnly.value && Array.isArray(filteredData)) {
      return filteredData[0] || null;
    }
    return filteredData;
  });

  async function getCollections() {
    const response = await api.get("/collections");
    collections.value = response.data.data
      .filter((collection) => !collection.collection.startsWith('directus_') || collection.collection === 'directus_files')
      .map((collection) => ({
        text: collection.collection,
        value: collection.collection,
      }));
  }

  async function fetchData() {
    if (!selectedCollection.value) return;

    const endpoint = selectedCollection.value === 'directus_files'
      ? `/files?fields=*`
      : `/items/${selectedCollection.value}?fields=*.*.*.*`;

    const response = await api.get(endpoint);
    jsonData.value = response.data.data;

    if (Array.isArray(response.data.data) && response.data.data.length > 0) {
      availableFields.value = Object.keys(response.data.data[0]);
    } else if (response.data.data) {
      availableFields.value = Object.keys(response.data.data);
    }
  }

  function updateDisplayData() {
    jsonData.value = { ...jsonData.value };
  }

  getCollections();
  if (selectedCollection.value) {
    fetchData();
  }
</script>

<style scoped>
.mb-4 {
  margin-bottom: 16px;
}
.mt-4 {
  margin-top: 16px;
}
.full {
  width: 100%;
}
.type-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}
.json-viewer {
  padding: 20px;
}
.v-card {
  max-width: 100%;
  width: 100%;
}
.field-selector {
  max-height: 300px;
  overflow-y: auto;
}
</style>
