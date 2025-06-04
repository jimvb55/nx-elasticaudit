<template>
  <div class="audit-detail">
    <v-row v-if="isLoading">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
        <div class="mt-4 text-subtitle-1">Loading audit data...</div>
      </v-col>
    </v-row>

    <template v-else-if="error">
      <v-row>
        <v-col cols="12" class="text-center py-12">
          <v-alert type="error" icon="mdi-alert-circle">
            {{ error }}
          </v-alert>
          <v-btn color="primary" class="mt-4" @click="$router.push('/')">
            Return to Home
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <template v-else-if="timelineData">
      <!-- Document Info Header -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon size="large" color="primary" class="mr-2">mdi-file-document-outline</v-icon>
              Document Details
              <v-spacer></v-spacer>
              <v-btn @click="goBackToSearch" variant="text" prepend-icon="mdi-arrow-left">
                Back to Search
              </v-btn>
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-identifier</v-icon>
                      </template>
                      <v-list-item-title>UUID</v-list-item-title>
                      <v-list-item-subtitle>{{ uuid }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item v-if="documentTitle">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-format-title</v-icon>
                      </template>
                      <v-list-item-title>Title</v-list-item-title>
                      <v-list-item-subtitle>{{ documentTitle }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item v-if="documentType">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-file-outline</v-icon>
                      </template>
                      <v-list-item-title>Document Type</v-list-item-title>
                      <v-list-item-subtitle>{{ documentType }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item v-if="documentPath">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-folder-outline</v-icon>
                      </template>
                      <v-list-item-title>Document Path</v-list-item-title>
                      <v-list-item-subtitle>{{ documentPath }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list density="compact">
                    <v-list-item v-if="firstEventDate">
                      <template v-slot:prepend>
                        <v-icon color="success">mdi-clock-start</v-icon>
                      </template>
                      <v-list-item-title>First Event</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDateTime(firstEventDate) }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item v-if="lastEventDate">
                      <template v-slot:prepend>
                        <v-icon color="error">mdi-clock-end</v-icon>
                      </template>
                      <v-list-item-title>Last Event</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDateTime(lastEventDate) }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item v-if="totalDuration">
                      <template v-slot:prepend>
                        <v-icon color="info">mdi-timer-outline</v-icon>
                      </template>
                      <v-list-item-title>Total Duration</v-list-item-title>
                      <v-list-item-subtitle>{{ totalDuration }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Timeline Visualization -->
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon size="large" color="primary" class="mr-2">mdi-chart-timeline-variant</v-icon>
              Audit Timeline
              <v-spacer></v-spacer>
              <v-btn-toggle v-model="chartType" mandatory density="comfortable">
                <v-btn value="bar">
                  <v-icon>mdi-chart-bar</v-icon>
                  <span class="ml-1 d-none d-sm-inline">Bar Chart</span>
                </v-btn>
                <v-btn value="timeline">
                  <v-icon>mdi-chart-timeline-variant</v-icon>
                  <span class="ml-1 d-none d-sm-inline">Timeline</span>
                </v-btn>
                <v-btn value="debug">
                  <v-icon>mdi-bug-outline</v-icon>
                  <span class="ml-1 d-none d-sm-inline">Debug</span>
                </v-btn>
              </v-btn-toggle>

              <v-switch
                v-model="showAllEvents"
                label="Show All Events"
                hide-details
                density="compact"
                color="primary"
                class="ml-4 d-inline-flex"
              ></v-switch>
            </v-card-title>
            <v-card-text>
              <div class="chart-container position-relative">
                <div v-if="isChartLoading" class="position-absolute d-flex justify-center align-center" style="top: 0; left: 0; right: 0; bottom: 0; z-index: 10; background: rgba(255,255,255,0.7)">
                  <v-progress-circular indeterminate color="primary"></v-progress-circular>
                </div>
                
                <component 
                  :is="getChartComponent()"
                  :timeline-data="filteredTimelineData"
                  :height="400"
                  :key="`chart-${refreshKey}-${chartType}-${showAllEvents}`"
                  @mounted="onChartMounted"
                />
              </div>
              <div class="text-center text-caption mt-2">
                Timeline showing document lifecycle events and duration between operations
                <v-chip size="x-small" color="info" class="ml-2" v-if="!showAllEvents && timelineData && filteredTimelineData">
                  {{ timelineData.timeline.length - filteredTimelineData.timeline.length }} events hidden
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Event Table -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card>
            <v-card-title class="d-flex align-center">
              <v-icon size="large" color="primary" class="mr-2">mdi-table</v-icon>
              Audit Events
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search events"
                single-line
                hide-details
                variant="outlined"
                density="compact"
                class="table-search"
              ></v-text-field>
            </v-card-title>
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <span v-if="!showAllEvents && events.length !== filteredEvents.length" class="text-caption">
                  Showing {{ filteredEvents.length }} of {{ events.length }} events
                  <v-chip size="x-small" color="info" class="ml-2">
                    {{ events.length - filteredEvents.length }} events filtered
                  </v-chip>
                </span>
                <span v-else class="text-caption">
                  Showing all {{ events.length }} events
                </span>
              </div>
              <v-data-table
                :headers="eventHeaders"
                :items="filteredEvents"
                :search="search"
                :loading="isLoading"
                density="comfortable"
                hover
                class="elevation-1"
                :items-per-page="10"
                :items-per-page-options="[10, 20, 50, 100]"
                @update:options="handlePaginationUpdate"
              >
                <template v-slot:item.eventDate="{ item }">
                  {{ formatDateTime(item.eventDate) }}
                </template>
                <template v-slot:item.eventId="{ item }">
                  <v-chip
                    :color="getEventColor(item.eventId)"
                    text-color="white"
                    size="small"
                  >
                    {{ item.eventId }}
                  </v-chip>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import TimelineChart from '@/components/TimelineChart.vue';
import BarChart from '@/components/BarChart.vue';
import DebugChart from '@/components/DebugChart.vue';

export default {
  name: 'AuditDetailView',
  components: {
    TimelineChart,
    BarChart,
    DebugChart
  },
  props: {
    uuid: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const isLoading = ref(true);
    const isChartLoading = ref(true);
    const error = ref(null);
    const timelineData = ref(null);
    const events = ref([]);
    const search = ref('');
    const chartType = ref('bar');
    const pagination = ref({
      page: 1,
      itemsPerPage: 10,
      sortBy: [{ key: 'eventDate', order: 'asc' }]
    });
    const refreshKey = ref(0);
    
    // Event filtering
    const showAllEvents = ref(false);
    const filteredEventTypes = [
      'securityUpdated',
      'documentSecurityUpdated',
      'Chain Called',
      'Sub-WF Changed',
      'rootRegistered',
      'rootUnregistered'
    ];
    
    // Computed property for filtered timeline data
    const filteredTimelineData = computed(() => {
      if (!timelineData.value) return null;
      if (showAllEvents.value) return timelineData.value;
      
      // Create a filtered copy of the timeline data
      const filtered = {
        ...timelineData.value,
        timeline: timelineData.value.timeline.filter(item => 
          !filteredEventTypes.includes(item.startEvent.eventId) && 
          !filteredEventTypes.includes(item.endEvent.eventId)
        )
      };
      
      return filtered;
    });
    
    // Computed property for filtered events table
    const filteredEvents = computed(() => {
      if (showAllEvents.value) return events.value;
      return events.value.filter(event => !filteredEventTypes.includes(event.eventId));
    });

    // Computed properties for document info
    const documentTitle = computed(() => {
      if (!events.value || !events.value.length) return null;
      // Try to find a document title from events
      for (const event of events.value) {
        if (event.title) return event.title;
      }
      return null;
    });

    const documentType = computed(() => {
      if (!events.value || !events.value.length) return null;
      return events.value[0]?.docType || null;
    });
    
    const documentPath = computed(() => {
      if (!events.value || !events.value.length) return null;
      // Try to find a document path from events
      for (const event of events.value) {
        if (event.docPath) return event.docPath;
      }
      return null;
    });

    const firstEventDate = computed(() => {
      return timelineData.value?.firstEvent?.eventDate || null;
    });

    const lastEventDate = computed(() => {
      return timelineData.value?.lastEvent?.eventDate || null;
    });

    const totalDuration = computed(() => {
      return timelineData.value?.totalDurationFormatted || null;
    });

    // Table headers
    const eventHeaders = [
      { title: 'Event Date', key: 'eventDate', sortable: true },
      { title: 'Event', key: 'eventId', sortable: true },
      { title: 'User', key: 'principalName', sortable: true },
      { title: 'Document Lifecycle', key: 'docLifeCycle', sortable: true },
      { title: 'Category', key: 'category', sortable: true }
    ];

    // Methods
    const loadAuditData = async () => {
      isLoading.value = true;
      error.value = null;

      try {
        const [timelineResponse, eventsResponse] = await Promise.all([
          api.getAuditTimeline(props.uuid),
          api.getAuditByUuid(props.uuid, { size: 1000, sort: 'eventDate:asc' })
        ]);

        timelineData.value = timelineResponse.data;
        events.value = eventsResponse.data.events;

        if (events.value.length === 0) {
          error.value = 'No audit events found for this document.';
        }
      } catch (err) {
        console.error('Error loading audit data:', err);
        error.value = 'Failed to load audit data. Please try again later.';
      } finally {
        isLoading.value = false;
      }
    };

    const handlePaginationUpdate = (options) => {
      pagination.value = {
        page: options.page,
        itemsPerPage: options.itemsPerPage
      };
    };

    const goBackToSearch = () => {
      if (route.query.from === 'search' && route.query.q) {
        router.push({ name: 'Search', params: { query: route.query.q } });
      } else {
        router.push('/');
      }
    };

    const formatDateTime = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    };

    const getEventColor = (eventId) => {
      const eventColors = {
        'documentCreated': 'success',
        'documentModified': 'info',
        'documentCheckedIn': 'orange',
        'documentCheckedOut': 'red',
        'documentLocked': 'grey',
        'documentUnlocked': 'green-lighten-1',
        'documentMoved': 'orange-darken-1',
        'documentRemoved': 'grey-darken-1',
        'loginSuccess': 'purple',
        'downloadRequest': 'blue'
      };

      return eventColors[eventId] || 'primary';
    };

    // Watch for chart type changes to force re-render
    watch(chartType, async (newVal) => {
      console.log(`Chart type changed to: ${newVal}`);
      // Show loading state while chart changes
      isChartLoading.value = true;
      // Increment refresh key to force component re-render
      await nextTick();
      refreshKey.value++;
    });
    
    // Get chart component based on selected type
    const getChartComponent = () => {
      switch (chartType.value) {
        case 'timeline':
          return TimelineChart;
        case 'bar':
          return BarChart;
        case 'debug':
          return DebugChart;
        default:
          return BarChart;
      }
    };
    
    // Handle chart mounted event
    const onChartMounted = () => {
      console.log('Chart mounted event received');
      // Use a small delay to ensure the chart is fully rendered
      setTimeout(() => {
        isChartLoading.value = false;
        console.log('Chart loading state set to false');
      }, 200);
    };

    // Load data on component mount
    onMounted(() => {
      loadAuditData();
    });

    return {
      isLoading,
      isChartLoading,
      error,
      timelineData,
      filteredTimelineData,
      events,
      filteredEvents,
      showAllEvents,
      search,
      chartType,
      pagination,
      refreshKey,
      documentTitle,
      documentType,
      documentPath,
      firstEventDate,
      lastEventDate,
      totalDuration,
      eventHeaders,
      formatDateTime,
      getEventColor,
      getChartComponent,
      handlePaginationUpdate,
      goBackToSearch,
      onChartMounted
    };
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
  position: relative;
}

.table-search {
  max-width: 300px;
}

@media (max-width: 768px) {
  .table-search {
    max-width: 100%;
  }
}
</style>
