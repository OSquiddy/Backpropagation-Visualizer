<script setup lang="ts">
import HeaderComponent from './components/HeaderComponent.vue'
import BasicPerceptron from './components/BasicPerceptron.vue'
</script>

<template>
  <div class="container">
    <HeaderComponent />
    <h3>Perceptron</h3>
    <p>A single layer perceptron is a simple neural network that can be used to classify data into two classes.</p>
    <BasicPerceptron />
    <h3>Multi-Layer Perceptron</h3>
    <p>A multi-layer perceptron is a neural network that can be used to classify data into multiple classes.</p>
    <h3>Deep Neural Network</h3>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  padding: 15px 30px;
  background-color: #f5f5f5;

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
  }

  p {
    font-size: 1rem;
  }
}

</style>
