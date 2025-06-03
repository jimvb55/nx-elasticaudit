<template>
  <div class="search-results">
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon size="large" color="primary" class="mr-2">mdi-magnify</v-icon>
            Search Results
            <v-spacer></v-spacer>
            <v-btn @click="$router.push('/')" variant="text" prepend-icon="mdi-arrow-left">
              Back to Search
            </v-btn>
          </v-card-title>
          <v-card-subtitle v-if="query">
            Results for "{{ query }}"
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="isLoading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <div class="mt-4 text-subtitle-1">Searching for documents...</div>
      </v-col>
    </v-row>

    <template v-else-if="error">
      <v-row>
        <v-col cols="12" class="text-center py-12">
          <v-alert type="error" icon="mdi-alert-circle">
            {{ error }}
          </v-alert>
          <v-btn color="primary" class="mt-4" @click="$router.push('/')">
            Try a Different Search
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <!-- Empty Results -->
      <v-row v-if="searchResults.length === 0" class="mt-4">
        <v-col cols="12" class="text-center py-12">
          <v-alert type="info" icon="mdi-information">
            No documents found matching "{{ query }}".
          </v-alert>
          <v-btn color="primary" class="mt-4" @click="$router.push('/')">
            Try a Different Search
          </v-btn>
        </v-col>
      </v-row>
      
      <!-- Results List -->
      <template v-else>
        <v-row class="mt-4">
          <v-col cols="12">
            <v-alert type="success" icon="mdi-check-circle">
              Found {{ searchResults.length }} document(s) matching your search.
            </v-alert>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col 
            v-for="document in searchResults" 
            :key="document.docUUID" 
            cols="12" md="6" lg="4"
          >
            <v-card class="document-card" @click="viewDocument(document.docUUID)">
              <v-card-title>
                <v-icon color="primary" class="mr-2">mdi-file-document-outline</v-icon>
                {{ document.title || 'Document ' + (document.docUUID || '').substring(0, 8) }}
              </v-card-title>
              <v-card-subtitle>
                {{ document.docType || 'Unknown Type' }}
              </v-card-subtitle>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary" size="small">mdi-identifier</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">UUID</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ document.docUUID }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="document.eventDate">
                    <template v-slot:prepend>
                      <v-icon color="primary" size="small">mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">Last Event</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ formatDateTime(document.eventDate) }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item v-if="document.principalName">
                    <template v-slot:prepend>
                      <v-icon color="primary" size="small">mdi-account</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">User</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ document.principalName }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn 
                  color="primary" 
                  variant="tonal" 
                  @click.stop="viewDocument(document.docUUID)"
                >
                  View Audit
                  <v-icon class="ml-2">mdi-arrow-right</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';

export default {
  name: 'SearchResultsView',
  props: {
    query: {
      type: String,
      required: true
    }
  },
  
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const isLoading = ref(true);
    const error = ref(null);
    const searchResults = ref([]);
    
    const loadSearchResults = async () => {
      isLoading.value = true;
      error.value = null;
      
      try {
        // Search by title
        const response = await api.getAuditByTitle(props.query);
        
        if (response.data.events && response.data.events.length > 0) {
          // Group results by document UUID
          const documents = {};
          
          response.data.events.forEach(event => {
            if (!documents[event.docUUID]) {
              documents[event.docUUID] = {
                docUUID: event.docUUID,
                docType: event.docType,
                title: event.title || null,
                eventDate: event.eventDate,
                principalName: event.principalName,
                events: []
              };
            }
            
            documents[event.docUUID].events.push(event);
            
            // Keep track of the latest event
            if (new Date(event.eventDate) > new Date(documents[event.docUUID].eventDate)) {
              documents[event.docUUID].eventDate = event.eventDate;
              documents[event.docUUID].principalName = event.principalName;
            }
          });
          
          searchResults.value = Object.values(documents);
        } else {
          searchResults.value = [];
        }
      } catch (err) {
        console.error('Error searching for documents:', err);
        error.value = 'Failed to search for documents. Please try again later.';
      } finally {
        isLoading.value = false;
      }
    };
    
    const viewDocument = (uuid) => {
      router.push({ name: 'AuditDetail', params: { uuid } });
    };
    
    const formatDateTime = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };
    
    onMounted(() => {
      loadSearchResults();
    });
    
    return {
      isLoading,
      error,
      searchResults,
      viewDocument,
      formatDateTime
    };
  }
};
</script>

<style scoped>
.document-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.document-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}
</style>
