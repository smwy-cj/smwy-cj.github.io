<script setup lang="ts">
import { computed } from 'vue'
import { labels, profile, type Locale } from '../site'
import Icon from './Icon.vue'

const props = defineProps<{ locale: Locale }>()
const t = computed(() => labels[props.locale])
</script>

<template>
  <main id="main-content" class="shell about-page" tabindex="-1">
    <div class="page-title">
      <div class="eyebrow">A little about me</div>
      <h1>{{ t.aboutTitle }}</h1>
      <p>{{ profile[locale].tagline }}</p>
    </div>
    <section class="about-row"><h2>{{ t.intro }}</h2><p>{{ profile[locale].description }}</p></section>
    <section class="about-row"><h2>{{ t.focus }}</h2><p>{{ profile[locale].focus }}</p></section>
    <section class="about-row"><h2>{{ t.interests }}</h2><p>{{ profile[locale].interests.join(' / ') }}</p></section>
    <section class="about-row"><h2>{{ t.contact }}</h2><div class="project-links">
      <a class="inline-link" :href="profile.github" target="_blank" rel="noopener noreferrer">GitHub <Icon name="diagonal" :size="13" /></a>
      <a class="inline-link" :href="'mailto:' + profile.email">{{ profile.email }} <Icon name="diagonal" :size="13" /></a>
    </div></section>
  </main>
</template>
