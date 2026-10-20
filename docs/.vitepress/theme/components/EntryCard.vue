<script setup lang="ts">
import { withBase } from 'vitepress'
import type { Entry } from '../types'
import Icon from './Icon.vue'
import ProjectArt from './ProjectArt.vue'
defineProps<{ entry: Entry; number?: number }>()
</script>
<template>
  <a :href="withBase(entry.url)" class="project-card tilt-card" data-reveal>
    <ProjectArt :variant="entry.cover" />
    <div class="project-card-body">
      <div class="card-topline"><span>{{ entry.category }}<span v-if="entry.directory"> / {{ entry.directory }}</span></span><span v-if="entry.sample" class="sample-label">示例项目</span></div>
      <div class="project-title"><h3>{{ entry.title }}</h3><Icon name="diagonal" :size="20" /></div>
      <p>{{ entry.description }}</p>
      <div class="project-tags"><span v-for="tag in entry.tags" :key="tag">{{ tag }}</span></div>
    </div>
  </a>
</template>
