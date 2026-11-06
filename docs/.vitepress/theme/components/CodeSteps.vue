<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { labels } from '../site'

const props = defineProps<{ steps: string[] }>()
const { lang } = useData()
const t = computed(() => lang.value === 'en' ? labels.en : labels.zh)
const selected = ref(0)
</script>

<template>
  <div class="code-steps">
    <div v-for="(_, index) in props.steps" :key="index" v-show="selected === index" class="code-step">
      <slot :name="'step-' + (index + 1)" />
    </div>
    <div class="code-step-buttons" role="group" :aria-label="t.step">
      <span aria-hidden="true">{{ t.step }}</span>
      <button v-for="(step, index) in props.steps" :key="index" :aria-pressed="selected === index" @click="selected = index">{{ step }}</button>
    </div>
  </div>
</template>
