<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { entriesFor } from '../entries'
import { labels, profile, routes, type Locale } from '../site'
import Carousel from './Carousel.vue'
import Icon from './Icon.vue'

const props = defineProps<{ locale: Locale }>()
const t = computed(() => labels[props.locale])
const links = computed(() => routes[props.locale])
</script>

<template>
  <main id="main-content" class="shell home-page" tabindex="-1">
    <h1 class="sr-only">{{ t.home }}</h1>
    <section class="overview-hero profile-with-avatar">
      <img class="profile-avatar" :src="withBase(profile.avatar)" :alt="t.avatar" width="80" height="80" />
      <div class="profile-note">
        <p>{{ profile[locale].description }}</p>
        <a class="inline-link" :href="withBase(links.about)">{{ t.more }} <Icon name="diagonal" :size="13" /></a>
      </div>
    </section>
    <Carousel :items="entriesFor(locale, 'article')" :locale="locale" kind="journal" />
    <Carousel :items="entriesFor(locale, 'project')" :locale="locale" kind="projects" />
    <div class="home-end"><span>{{ t.end }}</span><a class="inline-link" :href="withBase(links.about)">{{ t.about }} <Icon name="diagonal" :size="13" /></a></div>
  </main>
</template>
