<template>
  <v-app>
    <v-app-bar app elevation="1">
      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon size="large" color="primary" class="mr-2">mdi-file-document-multiple-outline</v-icon>
          <span>Nuxeo Audit Visualization</span>
        </div>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="toggleTheme">
        <v-icon>{{ isDarkTheme ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer app class="pa-4">
      <div class="text-center w-100">
        &copy; {{ new Date().getFullYear() }} — <strong>Nuxeo Audit Visualization</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script>
import { useTheme } from 'vuetify';
import { ref, computed, onMounted, watch } from 'vue';

export default {
  name: 'App',
  setup() {
    const theme = useTheme();
    const isDarkTheme = computed(() => theme.global.name.value === 'dark');

    const toggleTheme = () => {
      console.log('Toggle theme from', theme.global.name.value);
      theme.global.name.value = isDarkTheme.value ? 'light' : 'dark';
      console.log('Toggle theme to', theme.global.name.value);
      localStorage.setItem('theme', theme.global.name.value);
    };

    // Initialize theme from localStorage
    const initTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      console.log('Saved theme from localStorage:', savedTheme);
      if (savedTheme) {
        theme.global.name.value = savedTheme;
      } else {
        // Default to light theme if not specified
        theme.global.name.value = 'light';
        localStorage.setItem('theme', 'light');
      }
    };

    // Watch for theme changes to sync with localStorage
    watch(() => theme.global.name.value, (newTheme) => {
      console.log('Theme changed to:', newTheme);
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    });

    // Call on mount
    onMounted(() => {
      initTheme();
      // Apply theme to document for any CSS that might rely on it
      document.documentElement.setAttribute('data-theme', theme.global.name.value);
    });

    return {
      isDarkTheme,
      toggleTheme
    };
  }
};
</script>

<style>
.cursor-pointer {
  cursor: pointer;
}

.v-application {
  font-family: 'Roboto', sans-serif;
}
</style>
