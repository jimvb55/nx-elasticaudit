<template>
  <div class="debug-chart-container">
    <canvas ref="chartCanvas" class="chart-canvas"></canvas>
    <div class="debug-info">
      <div>Container Width: {{ containerWidth }}px</div>
      <div>Container Height: {{ containerHeight }}px</div>
      <div>Canvas Width: {{ canvasWidth }}px</div>
      <div>Canvas Height: {{ canvasHeight }}px</div>
      <div>Chart Created: {{ chartCreated ? 'Yes' : 'No' }}</div>
      
      <!-- Color diagnostics section -->
      <div class="color-diagnostics mt-4">
        <h3>Color Diagnostics</h3>
        <div 
          v-for="(color, eventId) in allColors" 
          :key="eventId"
          class="color-sample"
        >
          <div class="color-box" :style="{ backgroundColor: color }"></div>
          <div class="color-info">
            <div class="event-id">{{ eventId }}</div>
            <div class="color-hex">{{ color }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
import { getEventColor, getAllEventColors } from '@/utils';

// Register all Chart.js components
Chart.register(...registerables);

export default {
  name: 'DebugChart',
  props: {
    height: {
      type: Number,
      default: 300
    }
  },
  emits: ['mounted'],
  
  setup(props, { emit }) {
    const chartCanvas = ref(null);
    const containerWidth = ref(0);
    const containerHeight = ref(0);
    const canvasWidth = ref(0);
    const canvasHeight = ref(0);
    const chartCreated = ref(false);
    const allColors = ref(getAllEventColors());
    let chart = null;
    let resizeObserver = null;

    const updateDimensions = () => {
      if (chartCanvas.value) {
        const container = chartCanvas.value.parentElement;
        containerWidth.value = container.clientWidth;
        containerHeight.value = container.clientHeight;
        canvasWidth.value = chartCanvas.value.width;
        canvasHeight.value = chartCanvas.value.height;
      }
    };

    const createChart = () => {
      if (!chartCanvas.value) return;
      
      console.log('Creating debug chart');
      
      // Test color function directly
      console.log('Color test results:');
      console.log('documentCreated:', getEventColor('documentCreated'));
      console.log('documentModified:', getEventColor('documentModified'));
      console.log('documentCheckedIn:', getEventColor('documentCheckedIn'));
      console.log('documentCheckedOut:', getEventColor('documentCheckedOut'));
      
      // Destroy previous chart if it exists
      if (chart) {
        chart.destroy();
      }
      
      const ctx = chartCanvas.value.getContext('2d');
      
      // Create a simple line chart with our color scheme
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['documentCreated', 'documentModified', 'documentCheckedIn', 'documentCheckedOut', 'documentLocked', 'documentUnlocked'],
          datasets: [{
            label: 'Event Color Test',
            data: [12, 19, 3, 5, 2, 3],
            backgroundColor: [
              getEventColor('documentCreated'),
              getEventColor('documentModified'),
              getEventColor('documentCheckedIn'),
              getEventColor('documentCheckedOut'),
              getEventColor('documentLocked'),
              getEventColor('documentUnlocked'),
            ],
            borderColor: [
              getEventColor('documentCreated'),
              getEventColor('documentModified'),
              getEventColor('documentCheckedIn'),
              getEventColor('documentCheckedOut'),
              getEventColor('documentLocked'),
              getEventColor('documentUnlocked'),
            ],
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
      
      chartCreated.value = true;
      updateDimensions();
    };
    
    onMounted(() => {
      console.log('Debug chart component mounted');
      
      // Create resize observer to monitor container size changes
      resizeObserver = new ResizeObserver(() => {
        console.log('Debug chart container resized');
        updateDimensions();
        if (chart) {
          chart.resize();
        }
      });
      
      if (chartCanvas.value) {
        resizeObserver.observe(chartCanvas.value.parentElement);
      }
      
      // Initial dimensions update
      updateDimensions();
      
      // Create chart with a delay to ensure DOM is ready
      setTimeout(() => {
        createChart();
        // Emit mounted event
        emit('mounted');
      }, 500);
    });
    
    onBeforeUnmount(() => {
      // Clean up
      if (chart) {
        chart.destroy();
      }
      
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    });
    
    return {
      chartCanvas,
      containerWidth,
      containerHeight,
      canvasWidth,
      canvasHeight,
      chartCreated,
      allColors
    };
  }
};
</script>

<style scoped>
.debug-chart-container {
  width: 100%;
  height: v-bind('height + "px"');
  position: relative;
  border: 1px dashed #ff0000;
  padding: 8px;
  display: flex;
  flex-direction: column;
}

.chart-canvas {
  flex: 1;
  width: 100% !important;
  height: calc(100% - 100px) !important;
}

.debug-info {
  background-color: rgba(0, 0, 0, 0.1);
  color: #333;
  padding: 8px;
  font-size: 12px;
  font-family: monospace;
  margin-top: 8px;
  max-height: 500px;
  overflow-y: auto;
}

.color-diagnostics {
  border-top: 1px solid #ccc;
  padding-top: 8px;
}

.color-diagnostics h3 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 14px;
}

.color-sample {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.color-box {
  width: 20px;
  height: 20px;
  border: 1px solid #888;
  margin-right: 8px;
}

.color-info {
  display: flex;
  flex-direction: column;
}

.event-id {
  font-weight: bold;
}

.color-hex {
  font-size: 10px;
  color: #666;
}

.mt-4 {
  margin-top: 16px;
}
</style>
