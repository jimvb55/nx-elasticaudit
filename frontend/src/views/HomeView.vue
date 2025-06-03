<template>
  <div class="home">
    <v-row class="mt-8 mb-12">
      <v-col cols="12" class="text-center">
        <h1 class="text-h3 font-weight-bold text-primary mb-2">Nuxeo Audit Visualization</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Search for a document by UUID or title to visualize its audit history
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card elevation="3" class="pa-6 search-card">
          <v-form @submit.prevent="searchDocument">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="searchType"
                  :items="searchOptions"
                  label="Search by"
                  variant="outlined"
                  density="comfortable"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchValue"
                  :label="searchType === 'uuid' ? 'Enter UUID' : 'Enter title'"
                  variant="outlined"
                  density="comfortable"
                  :placeholder="searchType === 'uuid' ? 'e.g., 123e4567-e89b-12d3-a456-426614174000' : 'e.g., Project Report'"
                  :hint="searchType === 'uuid' ? 'Document unique identifier' : 'Document title'"
                  persistent-hint
                  autofocus
                  @keyup.enter="searchDocument"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" class="text-center">
                <v-btn
                  color="primary"
                  size="large"
                  type="submit"
                  :loading="isLoading"
                  :disabled="!searchValue"
                >
                  <v-icon left>mdi-magnify</v-icon>
                  Search
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-16">
      <v-col cols="12" md="4">
        <v-card class="feature-card">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" size="large" class="mr-2">mdi-file-search-outline</v-icon>
            Search Documents
          </v-card-title>
          <v-card-text>
            Find documents by their UUID or title. The system will search through the Nuxeo audit logs to find matching documents.
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="feature-card">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" size="large" class="mr-2">mdi-chart-timeline-variant</v-icon>
            Visualize Timeline
          </v-card-title>
          <v-card-text>
            See a detailed timeline visualization of document operations and the time spent between events. Identify bottlenecks and optimize workflows.
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card class="feature-card">
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" size="large" class="mr-2">mdi-table</v-icon>
            Detailed Audit Logs
          </v-card-title>
          <v-card-text>
            View comprehensive audit logs for each document, including event types, timestamps, users, and lifecycle changes.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'HomeView',
  
  setup() {
    const router = useRouter();
    const searchType = ref('uuid');
    const searchValue = ref('');
    const isLoading = ref(false);
    
    const searchOptions = [
      { title: 'UUID', value: 'uuid' },
      { title: 'Title', value: 'title' }
    ];
    
    const searchDocument = async () => {
      if (!searchValue.value) return;
      
      isLoading.value = true;
      
      try {
        if (searchType.value === 'uuid') {
          // Navigate to audit detail page with UUID
          router.push({ name: 'AuditDetail', params: { uuid: searchValue.value } });
        } else {
          // Navigate to search results with title query
          router.push({ name: 'Search', params: { query: searchValue.value } });
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        isLoading.value = false;
      }
    };
    
    return {
      searchType,
      searchValue,
      searchOptions,
      isLoading,
      searchDocument
    };
  }
};
</script>

<style scoped>
.search-card {
  transition: transform 0.3s ease;
  border-radius: 12px;
}

.search-card:hover {
  transform: translateY(-5px);
}

.feature-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 12px;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}
</style>
