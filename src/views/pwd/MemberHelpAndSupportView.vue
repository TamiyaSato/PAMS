<script setup lang="ts">
import { ref } from 'vue'
import '@mdi/font/css/materialdesignicons.css'

const faqs = ref([
  {
    question: 'How do I apply for barangay assistance?',
    answer:
      'To apply for barangay assistance, go to Apply for Services from the menu. Choose the service you want, review the details, and click Apply Here. Fill out the required information and submit your application.',
  },
  {
    question: 'What services can I apply for?',
    list: [
      'Wheelchair Distribution',
      'Prosthetic Devices',
      'Eyeglasses Distribution',
      'Medical or Financial Assistance',
      'Other PWD-related services offered by the barangay',
    ],
  },
  {
    question: 'Can I apply for more than one service?',
    answer:
      'Yes, you may apply for multiple services as long as you meet the requirements and there are available slots.',
  },
  {
    question: 'Why was my application rejected?',
    answer:
      'Applications may be rejected due to incomplete documents, not meeting requirements, or duplicate information.',
  },
  {
    question: 'Can someone apply on my behalf?',
    answer:
      'Yes, a representative may assist you, but all submitted information must be accurate and valid.',
  },
  {
    question: 'Who can I contact if I need help?',
    answer:
      'You may reach out through the Contact Support section to connect with your barangay office.',
  },
])
</script>

<template>
  <v-container fluid class="help-wrapper">
    <v-card class="help-card" elevation="0">
      <h3 class="text-center">Hi. How can we help?</h3>

      <v-text-field
        placeholder="Type your question here..."
        prepend-inner-icon="mdimagnify"
        variant="solo"
        density="comfortable"
        hide-details
        class="search-bar"
      />

      <div class="action-grid">
        <v-card class="action-card" elevation="0">
          <h4>Apply for Services</h4>
          <p>Learn how to submit an application</p>
        </v-card>

        <v-card class="action-card" elevation="0">
          <h4>Application Status Guide</h4>
          <p>Track and understand your status</p>
        </v-card>

        <v-card class="action-card" elevation="0">
          <h4>History & Documents</h4>
          <p>Access uploaded records</p>
        </v-card>

        <v-card class="action-card" elevation="0">
          <h4>Appointments & Schedule</h4>
          <p>Check or manage schedules</p>
        </v-card>
      </div>
    </v-card>

    <v-card class="faq-card" elevation="0">
      <h3 class="faq-title">Frequently Asked Questions (FAQ)</h3>

      <v-expansion-panels variant="accordion">
        <v-expansion-panel v-for="(faq, index) in faqs" :key="index" elevation="0">
          <v-expansion-panel-title>
            {{ faq.question }}
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <p v-if="faq.answer">
              {{ faq.answer }}
            </p>

            <ul v-if="faq.list" class="faq-list">
              <li v-for="(item, i) in faq.list" :key="i">
                {{ item }}
              </li>
            </ul>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card>

    <v-card class="contact-card" elevation="0">
      <h3>Contact Support</h3>

      <div class="contact-grid">
        <div>
          <p>123 Mabini St., Brgy. San Isidro<br />Quezon City</p>
        </div>

        <div>
          <p>0912-345-6789</p>
        </div>

        <div>
          <p>Monday – Friday<br />8:00 AM – 5:00 PM</p>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.help-wrapper {
  background: #f4f8fb;
  padding: 28px;
  min-height: 100vh;
}

/* ================= HEADER ================= */
.header {
  margin-bottom: 18px;
}

.header h2 {
  font-weight: 600;
  font-size: 18px;
  color: #0f172a;
}

.last-login {
  font-size: 13px;
  color: #64748b;
}

/* ================= MAIN HELP CARD ================= */
.help-card {
  background: #ffffff;
  padding: 36px;
  border-radius: 16px;
  margin-bottom: 28px;
  border: 1px solid #e2e8f0;
}

.help-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  text-align: center;
}

/* ================= SEARCH ================= */
.search-bar {
  max-width: 460px;
  margin: 22px auto 10px;
}

/* ================= ACTION CARDS ================= */
.action-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-top: 26px;
}

.action-card {
  background: #eef5f9;
  padding: 22px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  /* 🔥 FIX: FORCE PERFECT CENTER */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.action-card:hover {
  background: #e6f0f7;
  transform: translateY(-2px);
}

/* 🔥 HARD FIX FOR VUETIFY ICONS */
.action-card :deep(.v-icon) {
  font-size: 28px;
  color: #1e3a8a;
  margin-bottom: 10px;
  line-height: 1;
}

/* REMOVE INLINE ICON WEIRDNESS */
.action-card :deep(.v-icon__svg),
.action-card :deep(.v-icon svg) {
  display: block;
}

.action-card h4 {
  font-size: 13px;
  font-weight: 600;
  color: #1e3a8a;
  margin: 4px 0 2px;
}

.action-card p {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}

/* ================= FAQ CONTAINER ================= */
.faq-card {
  background: #eef5f9;
  border-radius: 12px;
  border: 1px solid #dbe4ec;
  overflow: hidden;
  padding: 0;
}

.faq-title {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #1e3a8a;
  padding: 18px 0;
  border-bottom: 1px solid #dbe4ec;
}
.faq-list {
  padding-left: 20px;
  margin-top: 8px;
}

.faq-list li {
  margin-bottom: 6px;
  line-height: 1.6;
}

/* ================= PANELS ================= */
.v-expansion-panels {
  background: transparent;
}

.v-expansion-panel {
  background: transparent;
  box-shadow: none;
  border-bottom: 1px solid #dbe4ec;
}

.v-expansion-panel:last-child {
  border-bottom: none;
}

/* ================= QUESTION ROW ================= */
.v-expansion-panel-title {
  padding: 18px 22px;
  font-size: 13.5px;
  font-weight: 600;
  color: #1e3a8a;
  display: flex;
  align-items: center;
}

/* CHEVRON RIGHT */
.v-expansion-panel-title__icon {
  margin-left: auto;
}

/* ================= ANSWER ================= */
.v-expansion-panel-text {
  padding: 0 22px 18px;
  font-size: 12.5px;
  color: #334155;
  line-height: 1.65;
}

/* ================= BULLET LIST (EXACT LOOK) ================= */
.v-expansion-panel-text ul {
  margin: 8px 0 6px;
  padding-left: 20px;
  list-style-type: disc;
}

.v-expansion-panel-text li {
  margin-bottom: 6px;
  font-size: 12.5px;
  color: #0f172a;
}

/* SUPPORTING TEXT BELOW BULLETS */
.v-expansion-panel-text p {
  margin-top: 6px;
  font-size: 12.5px;
  color: #334155;
}

.contact-card {
  background: #ffffff;
  padding: 28px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}

.contact-card h3 {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #1e3a8a;
  margin-bottom: 20px;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.contact-grid > div {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.contact-grid :deep(.v-icon) {
  font-size: 26px;
  color: #1e3a8a;
  margin-bottom: 6px;
  line-height: 1;
}

.contact-grid :deep(.v-icon svg) {
  display: block;
}

.contact-grid p {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.4;
}
</style>
