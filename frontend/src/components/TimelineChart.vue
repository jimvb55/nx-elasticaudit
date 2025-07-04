<template>
  <div class="timeline-chart-container">
    <canvas ref="chartCanvas" class="chart-canvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { getEventColor } from '@/utils';

// Register all Chart.js components
Chart.register(...registerables);

export default {
  name: 'TimelineChart',
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
    const chartCanvas = ref(null);
    let chart = null;
    let resizeObserver = null;

    // Event colors are now imported from eventColors utility

    const formatDuration = (ms) => {
      if (ms < 1000) return `${ms}ms`;
      
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    };

    const createChart = () => {
      if (!chartCanvas.value || !props.timelineData) return;
      
      const { timeline } = props.timelineData;
      
      if (!timeline || !timeline.length) {
        console.warn('Timeline data is empty or invalid');
        return;
      }
      
      console.log('Creating timeline chart with data:', timeline);
      
      // Destroy previous chart if it exists
      if (chart) {
        chart.destroy();
      }
      
      const ctx = chartCanvas.value.getContext('2d');
      
      if (!ctx) {
        console.error('Failed to get 2D context from canvas');
        return;
      }
      
      console.log('Successfully obtained 2D context for timeline chart');
      
      // Prepare data for the timeline chart
      const labels = timeline.map((event, index) => `Step ${index + 1}`);
      const durations = timeline.map(event => event.durationMs);
      const eventLabels = timeline.map(event => 
        `${event.startEvent.eventId} → ${event.endEvent.eventId} (${event.durationFormatted})`
      );
      
      // Get colors for each event
      const backgroundColors = timeline.map(event => {
        const eventId = event.startEvent.eventId;
        const color = getEventColor(eventId);
        console.log(`TimelineChart color for event ${eventId}: ${color}`);
        return color;
      });
      
      // Create a single dataset with all data points
      // We'll use a single dataset with segment configuration to maintain connections between points
      const dataset = {
        label: 'Timeline',
        data: durations,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        // This enables individual segment coloring
        segment: {
          borderColor: (ctx) => {
            // If we're in between two points, use the color of the first point
            if (ctx.p0DataIndex !== undefined && ctx.p1DataIndex !== undefined) {
              return backgroundColors[ctx.p0DataIndex];
            }
            return 'rgba(0,0,0,0.1)'; // Fallback
          }
        }
      };
      
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [dataset]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
              tooltip: {
                callbacks: {
                  title: (tooltipItems) => {
                    // Get the index of the first tooltip item
                    const index = tooltipItems[0].dataIndex;
                    return eventLabels[index];
                  },
                  label: (context) => {
                    const index = context.dataIndex;
                    
                    // Display duration
                    const durationLabel = `Duration: ${formatDuration(durations[index])}`;
                    
                    // Get the event info
                    const startEvent = timeline[index].startEvent;
                    const endEvent = timeline[index].endEvent;
                    const startUser = startEvent.principalName || 'Unknown';
                    const endUser = endEvent.principalName || 'Unknown';
                    
                    return [
                      durationLabel,
                      `Start: ${new Date(timeline[index].startTime).toLocaleString()}`,
                      `End: ${new Date(timeline[index].endTime).toLocaleString()}`,
                      `Start User: ${startUser}`,
                      `End User: ${endUser}`,
                      `Start Event: ${startEvent.eventId}`,
                      `End Event: ${endEvent.eventId}`
                    ];
                  },
                  // Add footer to show color information
                  footer: (tooltipItems) => {
                    const index = tooltipItems[0].dataIndex;
                    const color = backgroundColors[index];
                    const eventId = timeline[index].startEvent.eventId;
                    return [`Event Type: ${eventId}`, `Color: ${color}`];
                  }
                }
              }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Duration (ms)'
              },
              ticks: {
                callback: function(value) {
                  return formatDuration(value);
                }
              }
            },
            x: {
              title: {
                display: true,
                text: 'Event Transitions'
              }
            }
          }
        }
      });
    };
    
    onMounted(() => {
      console.log('TimelineChart component mounted');
      
      // Create resize observer to monitor container size changes
      resizeObserver = new ResizeObserver(() => {
        console.log('TimelineChart container resized');
        if (chart) {
          chart.resize();
          console.log('TimelineChart resized');
        }
      });
      
      if (chartCanvas.value) {
        const parent = chartCanvas.value.parentElement;
        if (parent) {
          resizeObserver.observe(parent);
          console.log('Resize observer attached to timeline chart parent');
        }
      }
      
      // Create chart with a short delay to ensure DOM is ready
      setTimeout(() => {
        createChart();
        
        // Emit mounted event after chart is created
        console.log('TimelineChart emitting mounted event');
        emit('mounted');
      }, 300);
    });
    
    // Watch both the entire timeline data object and any nested changes
    watch(() => props.timelineData, (newData) => {
      console.log('TimelineChart detected timelineData change:', 
        newData ? `Timeline with ${newData.timeline.length} items` : 'No data');
      
      // Debugging info about colors
      if (newData && newData.timeline) {
        newData.timeline.forEach((item, index) => {
          const eventId = item.startEvent.eventId;
          const color = getEventColor(eventId);
          console.log(`TimelineChart item ${index}: Event ${eventId} → Color: ${color}`);
        });
      }
      
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
      
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });
    
    return {
      chartCanvas
    };
  }
};
</script>

<style scoped>
.timeline-chart-container {
  width: 100%;
  height: v-bind('height + "px"');
  position: relative;
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
