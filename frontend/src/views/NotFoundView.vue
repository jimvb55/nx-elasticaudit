<template>
  <div class="not-found">
    <v-row>
      <v-col cols="12" md="8" offset-md="2" class="text-center py-12">
        <v-card elevation="3" class="pa-8">
          <v-card-text>
            <div class="text-h1 font-weight-bold text-primary mb-8">404</div>
            <div class="text-h4 mb-4">Page Not Found</div>
            <div class="text-subtitle-1 mb-8">
              The page you are looking for doesn't exist or has been moved.
            </div>
            <v-btn 
              color="primary" 
              size="large" 
              @click="$router.push('/')"
              prepend-icon="mdi-home"
            >
              Return to Home
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView'
};
</script>

<style scoped>
.not-found {
  padding: 2rem 0;
}
</style>
