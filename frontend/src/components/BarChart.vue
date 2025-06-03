<template>
  <div class="bar-chart-container" ref="chartContainer"></div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';

// Register all Chart.js components
Chart.register(...registerables);

export default {
  name: 'BarChart',
  props: {
    timelineData: {
      type: Object,
      required: true
    },
    height: {
      type: Number,
      default: 300
    }
  },
  emits: ['mounted'],
  
  setup(props, { emit }) {
    const chartContainer = ref(null);
    let chart = null;

    const eventColors = {
      'documentCreated': '#4CAF50',      // Green
      'documentModified': '#2196F3',     // Blue
      'documentPublished': '#9C27B0',    // Purple
      'documentCheckedIn': '#FF9800',    // Orange
      'documentCheckedOut': '#F44336',   // Red
      'documentLocked': '#607D8B',       // Blue Grey
      'documentUnlocked': '#8BC34A',     // Light Green
      'documentMoved': '#FF5722',        // Deep Orange
      'documentVersioned': '#795548',    // Brown
      'documentRemoved': '#9E9E9E',      // Grey
      'workflowTaskCompleted': '#FFEB3B', // Yellow
      'commentAdded': '#00BCD4',         // Cyan
      'loginSuccess': '#673AB7',         // Deep Purple
      'downloadRequest': '#3F51B5',      // Indigo
      'default': '#1976D2'               // Default Blue
    };

    const getEventColor = (eventId) => {
      return eventColors[eventId] || eventColors.default;
    };

    const formatDuration = (ms) => {
      if (ms < 1000) return `${ms}ms`;
      
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) {
        return `${days}d ${hours % 24}h ${minutes % 60}m`;
      }
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    };

    const createChart = () => {
      if (!chartContainer.value || !props.timelineData) return;
      
      const { timeline, firstEvent, lastEvent, totalDurationMs } = props.timelineData;
      
      if (!timeline || !timeline.length) {
        console.warn('Timeline data is empty or invalid for bar chart');
        return;
      }
      
      console.log('Creating bar chart with data:', timeline);
      
      // Destroy previous chart if it exists
      if (chart) {
        chart.destroy();
      }
      
      const ctx = chartContainer.value.getContext('2d');
      
      // Create data for stacked horizontal bar chart
      const datasets = [];
      const labels = ['Document Lifecycle'];
      
      // Calculate starting point for each event segment
      let currentPosition = 0;
      const startPositions = [];
      const durations = [];
      const colors = [];
      const eventLabels = [];
      
      // First add an empty segment for better visualization if needed
      /*
      if (timeline.length > 0) {
        const firstStart = new Date(firstEvent.eventDate).getTime();
        const firstEnd = new Date(timeline[0].startTime).getTime();
        const initialDuration = firstEnd - firstStart;
        
        if (initialDuration > 0) {
          startPositions.push(0);
          durations.push(initialDuration);
          colors.push('rgba(200, 200, 200, 0.3)');
          eventLabels.push(`Initial State (${formatDuration(initialDuration)})`);
          currentPosition += initialDuration;
        }
      }
      */
      
      // Add each timeline segment
      timeline.forEach((item, index) => {
        startPositions.push(currentPosition);
        durations.push(item.durationMs);
        colors.push(getEventColor(item.startEvent.eventId));
        eventLabels.push(`${item.startEvent.eventId} → ${item.endEvent.eventId} (${item.durationFormatted})`);
        currentPosition += item.durationMs;
      });
      
      // Create datasets for stacked bar chart
      durations.forEach((duration, index) => {
        const dataset = {
          label: eventLabels[index],
          data: [duration],
          backgroundColor: colors[index],
          barPercentage: 0.8,
          categoryPercentage: 0.9,
          // This is the key for stacking the bars properly
          stack: 'Stack 0'
        };
        datasets.push(dataset);
      });
      
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            tooltip: {
              callbacks: {
                title: (tooltipItems) => {
                  return eventLabels[tooltipItems[0].datasetIndex];
                },
                label: (context) => {
                  const duration = durations[context.datasetIndex];
                  const startEvent = timeline[context.datasetIndex]?.startEvent;
                  const endEvent = timeline[context.datasetIndex]?.endEvent;
                  
                  return [
                    `Duration: ${formatDuration(duration)}`,
                    `Start: ${new Date(startEvent?.eventDate).toLocaleString()}`,
                    `End: ${new Date(endEvent?.eventDate).toLocaleString()}`,
                    `User: ${startEvent?.principalName || 'Unknown'}`
                  ];
                }
              }
            },
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 15,
                font: {
                  size: 10
                }
              }
            },
            title: {
              display: true,
              text: `Document Timeline (Total: ${formatDuration(totalDurationMs)})`,
              font: {
                size: 16
              }
            }
          },
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: 'Duration'
              },
              ticks: {
                callback: function(value) {
                  return formatDuration(value);
                }
              }
            },
            y: {
              stacked: true,
              title: {
                display: false
              }
            }
          }
        }
      });
    };
    
    onMounted(() => {
      // Create chart immediately
      createChart();
      
      // Force a resize event to ensure chart renders correctly in containers
      window.dispatchEvent(new Event('resize'));
      
      // Emit mounted event
      setTimeout(() => {
        emit('mounted');
      }, 100);
    });
    
    // Watch both the entire timeline data object and any nested changes
    watch(() => props.timelineData, () => {
      createChart();
      // Force a resize event to ensure chart renders correctly
      window.dispatchEvent(new Event('resize'));
    }, { deep: true });
    
    // Additional watch for component height changes
    watch(() => props.height, () => {
      createChart();
      // Force a resize event to ensure chart renders correctly
      window.dispatchEvent(new Event('resize'));
    });
    
    // Clean up chart instance when component is destroyed
    onBeforeUnmount(() => {
      if (chart) {
        chart.destroy();
        chart = null;
      }
    });
    
    return {
      chartContainer
    };
  }
};
</script>

<style scoped>
.bar-chart-container {
  width: 100%;
  height: v-bind('height + "px"');
  position: relative;
}
</style>
