<script setup lang="ts"></script>

<template>
  <v-container fluid class="activitylogs">
    <h1 class="title">Activity Logs</h1>

    <div class="content">
      <p class="coming-soon">NEW FEATURES COMING SOON...</p>

      <img src="/PAMSlogo.png" alt="PAMS Logo" style="width: 500px" />
    </div>
  </v-container>
</template>

<style scoped>
.content {
  min-height: calc(100vh - 160px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.activitylogs {
  background: #eef5f9;
  padding: 24px;
  min-height: 100vh;
}

.page {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 40px;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.coming-soon {
  font-size: 30px;
  font-weight: 600;
  color: #1f2a44;
  margin-bottom: 16px;
}

.logo {
  margin-top: 8px;
}
</style>
