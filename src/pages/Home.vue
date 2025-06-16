<template>
  <!-- Hero Section -->
  <section class="hero-section" ref="hero">
    <div class="hero-content">
      <h1 class="text-h2 text-md-h1 font-weight-bold mb-4">BodyBud</h1>
      <p class="text-h5 mb-8">All-in-one bodybuilding.</p>
      <a
        href="https://apps.apple.com/us/app/bodybud/id6742726101"
        target="_blank"
        rel="noopener"
      >
        <v-img
          :src="downloadImage"
          alt="Download on the App Store"
          width="200"
          eager
        ></v-img>
      </a>
      <video autoplay loop muted playsinline class="hero-video">
        <source :src="videoSrc" :type="videoType" />
        <!-- Fallback for browsers that don't support WebM -->
        Your browser does not support HTML5 video.
      </video>
    </div>
  </section>

  <!-- Nutrition Tracking -->
  <section class="feature-section" ref="feature1">
    <div class="text-content">
      <h2 class="text-h3 text-md-h2 font-weight-bold mb-4">
        Precision Nutrition
      </h2>
      <p class="text-h5 mb-4">
        Track macros and calories with our intuitive food logger. Scan barcodes,
        save meals, and hit your targets effortlessly.
      </p>
      <ul class="text-h6">
        <li>Custom macro goals</li>
        <li>Barcode scanner for quick entries</li>
        <li>Quickadd functions</li>
      </ul>
    </div>
    <div class="image-placeholder feature-image">
      <v-img :src="foodImage" contain eager></v-img>
    </div>
  </section>

  <!-- Workout Tracking -->
  <section class="feature-section reverse" ref="feature2">
    <div class="text-content">
      <h2 class="text-h3 text-md-h2 font-weight-bold mb-4">
        Smart Workout Logging
      </h2>
      <p class="text-h5 mb-4">Build, track, and analyze every workout.</p>
      <ul class="text-h6">
        <li>Create custom workout splits</li>
        <li>Track PRs and progressive overload</li>
        <li>Exercise library with animations</li>
        <li>Intuitive weight selection tools</li>
      </ul>
    </div>
    <div class="image-placeholder feature-image">
      <v-img :src="workoutImage" contain eager></v-img>
    </div>
  </section>

  <!-- Health Metrics -->
  <section class="feature-section" ref="feature3">
    <div class="text-content">
      <h2 class="text-h3 text-md-h2 font-weight-bold mb-4">
        Comprehensive Health Tracking
      </h2>
      <p class="text-h5 mb-4">
        Monitor key metrics for optimal bodybuildling outcomes.
      </p>
      <ul class="text-h6">
        <li>Daily step counter</li>
        <li>Supplement regimen tracker with reminder alerts</li>
        <li>Bodyweight and blood pressure trends</li>
      </ul>
    </div>
    <div class="image-placeholder feature-image">
      <v-img :src="supplementImage" contain eager></v-img>
    </div>
  </section>

  <!-- Social Community -->
  <section class="feature-section reverse" ref="feature4">
    <div class="text-content">
      <h2 class="text-h3 text-md-h2 font-weight-bold mb-4">
        Your Fitness Inner Circle
      </h2>
      <p class="text-h5 mb-4">
        Share privately with gym buddies who keep you motivated
      </p>

      <div class="chip-container mb-4">
        <v-chip-group column>
          <v-chip
            variant="outlined"
            size="large"
            class="ma-1"
            prepend-icon="mdi-arm-flex"
          >
            Lifting Videos
          </v-chip>
          <v-chip
            variant="outlined"
            size="large"
            class="ma-1"
            prepend-icon="mdi-dumbbell"
          >
            Workouts
          </v-chip>
          <v-chip
            variant="outlined"
            size="large"
            class="ma-1"
            prepend-icon="mdi-food-apple"
          >
            Meals
          </v-chip>
          <v-chip
            variant="outlined"
            size="large"
            class="ma-1"
            prepend-icon="mdi-trophy-award"
          >
            PR Announcements
          </v-chip>
          <v-chip
            variant="outlined"
            size="large"
            class="ma-1"
            prepend-icon="mdi-image-multiple"
          >
            Progress Pics
          </v-chip>
          <v-chip
            variant="outlined"
            size="large"
            class="ma-1"
            prepend-icon="mdi-chart-areaspline"
          >
            Physique updates
          </v-chip>
          <v-chip
            variant="outlined"
            size="large"
            class="ma-1"
            prepend-icon="mdi-arm-flex"
          >
            Posing Videos
          </v-chip>
        </v-chip-group>
      </div>

      <div class="text-h6">
        • Private sharing only with approved friends<br />
        • Keep a trace of all the work you put in<br />
        • Celebrate each other's gains
      </div>
    </div>
    <div class="image-placeholder feature-image">
      <v-img :src="profileImage" contain eager></v-img>
    </div>
  </section>

  <!-- Final CTA -->
  <section class="cta-section" ref="cta">
    <h2 class="text-h3 text-md-h2 font-weight-bold mb-4">
      Ready to transform your fitness journey?
    </h2>
    <p class="text-h5 mb-8">Your complete bodybuilding toolkit awaits</p>
    <a
      href="https://apps.apple.com/us/app/bodybud/id6742726101"
      target="_blank"
      rel="noopener"
    >
      <v-img
        :src="downloadImage"
        alt="Download on the App Store"
        width="220"
        class="app-store-badge"
        eager
      ></v-img>
    </a>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

import dashboardImage from "../assets/dashboard.png";
import foodImage from "../assets/food.png";
import workoutImage from "../assets/workout.png";
import profileImage from "../assets/profile.png";
import feedImage from "../assets/feed.png";
import templateImage from "../assets/template.png";
import weightImage from "../assets/weight.png";
import supplementImage from "../assets/supplement.png";
import downloadImage from "../assets/black.svg";

// Dynamic video source selection
const videoSrc = ref("");
const videoType = ref("");

onMounted(() => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    videoSrc.value = new URL("../assets/preview.mp4", import.meta.url).href;
    videoType.value = "video/mp4";
  } else {
    videoSrc.value = new URL("../assets/preview.webm", import.meta.url).href;
    videoType.value = 'video/webm; codecs="vp9"';
  }

  setupObserver(hero.value, "fade-in");
  setupObserver(feature1.value, "slide-up");
  setupObserver(feature2.value, "slide-up");
  setupObserver(feature3.value, "slide-up");
  setupObserver(feature4.value, "slide-up");
  setupObserver(gallery.value, "fade-in");
  setupObserver(cta.value, "scale-up");
});

const hero = ref(null);
const feature1 = ref(null);
const feature2 = ref(null);
const feature3 = ref(null);
const feature4 = ref(null);
const gallery = ref(null);
const cta = ref(null);

function setupObserver(element, animationClass) {
  useIntersectionObserver(
    element,
    ([{ isIntersecting }]) => {
      if (isIntersecting) {
        element.classList.add(animationClass);
      }
    },
    { threshold: 0.1 },
  );
}

const onDownload = () => {
  window.open("https://apps.apple.com/us/app/bodybud/id6742726101", "_blank");
};
</script>

<style scoped>
/* Base Styles */
section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  position: relative;
  overflow: hidden;
}

.text-content {
  max-width: 500px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  text-align: left;
}

/* Placeholder Styles */
.image-placeholder {
  background-size: cover;
  background-position: center;
  border-radius: 8px;
}

.hero-image {
  width: 100%;
  height: 60vh;
  background-color: #f5f5f7;
  margin-top: 40px;
}

.hero-video {
  width: 100%;
  height: 60vh;
  max-width: 800px;
  margin-top: 40px;
}

.feature-image {
  width: 100%;
  max-width: 500px;
  height: auto;
}

.gallery-item {
  width: 100%;
  height: 300px;
  background-color: #d1d1d6;
}

/* Section Specific Styles */
.hero-section {
  display: flex;
  flex-direction: column;
  text-align: center;
  justify-content: center;
  background-color: #000;
  color: white;
}

.feature-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 80px 40px;
  margin: 0 auto;
}

.feature-section.reverse {
  background-color: #f5f5f7;
}

.gallery-section {
  flex-direction: column;
  background-color: white;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 1200px;
}

.cta-section {
  flex-direction: column;
  text-align: center;
  background-color: #f5f5f7;
}

/* Animations */
.fade-in {
  animation: fadeIn 1s ease-out forwards;
}

.slide-up {
  animation: slideUp 1s ease-out forwards;
}

.scale-up {
  animation: scaleUp 1s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Adjustments */
@media (min-width: 960px) {
  .feature-section {
    flex-direction: row;
    text-align: left;
  }

  .feature-section.reverse {
    flex-direction: row-reverse;
  }

  .hero-content {
    max-width: 800px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.gallery-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px;
  text-align: center;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 8px;
  position: relative;
  padding-left: 24px;
}

li:before {
  content: "";
  position: absolute;
  left: 0;
  top: 8px;
  width: 12px;
  height: 12px;
  background-color: currentColor;
  border-radius: 50%;
}

.feature-section:nth-child(odd) li:before {
  background-color: #000; /* Dark for light sections */
}

.feature-section.reverse li:before {
  background-color: #fff; /* White for dark sections */
}

/* Color adjustments for better contrast */
.hero-section {
  background: linear-gradient(135deg, #000000, #1204d0);
}

.feature-section.reverse {
  background-color: #121212;
  color: white;
}

.feature-section:nth-child(4) {
  background-color: #f8f9fa;
}

.app-store-badge {
  transition: transform 0.2s ease;
  cursor: pointer;
}

.app-store-badge:hover {
  transform: scale(1.05);
}
</style>
