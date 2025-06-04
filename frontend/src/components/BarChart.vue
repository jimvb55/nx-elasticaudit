<template>
  <div class="bar-chart-container">
    <canvas ref="chartCanvas" class="chart-canvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import { getEventColor } from '@/utils';

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
    const chartCanvas = ref(null);
    let chart = null;
    let resizeObserver = null;

    // Event colors are now imported from eventColors utility

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
      if (!chartCanvas.value || !props.timelineData) return;
      
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
      
      const ctx = chartCanvas.value.getContext('2d');
      
      if (!ctx) {
        console.error('Failed to get 2D context from canvas');
        return;
      }
      
      console.log('Successfully obtained 2D context for bar chart');
      
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
        const color = getEventColor(item.startEvent.eventId);
        colors.push(color);
        console.log(`BarChart color for event ${item.startEvent.eventId}: ${color}`);
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
                    const startUser = startEvent?.principalName || 'Unknown';
                    const endUser = endEvent?.principalName || 'Unknown';
                    
                    return [
                      `Duration: ${formatDuration(duration)}`,
                      `Start: ${new Date(startEvent?.eventDate).toLocaleString()}`,
                      `End: ${new Date(endEvent?.eventDate).toLocaleString()}`,
                      `Start User: ${startUser}`,
                      `End User: ${endUser}`
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
      console.log('BarChart component mounted');
      
      // Create resize observer to monitor container size changes
      resizeObserver = new ResizeObserver(() => {
        console.log('BarChart container resized');
        if (chart) {
          chart.resize();
          console.log('BarChart resized');
        }
      });
      
      if (chartCanvas.value) {
        const parent = chartCanvas.value.parentElement;
        if (parent) {
          resizeObserver.observe(parent);
          console.log('Resize observer attached to bar chart parent');
        }
      }
      
      // Create chart with a short delay to ensure DOM is ready
      setTimeout(() => {
        createChart();
        
        // Emit mounted event after chart is created
        console.log('BarChart emitting mounted event');
        emit('mounted');
      }, 300);
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
.bar-chart-container {
  width: 100%;
  height: v-bind('height + "px"');
  position: relative;
}

.chart-canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
