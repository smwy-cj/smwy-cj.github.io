<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 20 })
const paths: Record<string, string> = {
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  diagonal: 'M6 18 18 6M6 6h12v12',
  down: 'M12 4v16m-6-6 6 6 6-6',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  moon: 'M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'm6 6 12 12M6 18 18 6',
  book: 'M12 6c-3-2-6-2-10-1v14c4-1 7-1 10 1 3-2 6-2 10-1V5c-4-1-7-1-10 1Zm0 0v14',
  code: 'm8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16',
  layers: 'm12 3 10 5-10 5L2 8 12 3Zm-10 9 10 5 10-5M2 16l10 5 10-5',
  grid: 'M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7Z',
  github: 'M9 19c-4.3 1.3-4.3-2-6-2m12 4v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.2-3.2 4.3 4.3 0 0 0-.1-3.1s-1-.3-3.3 1.2a11.4 11.4 0 0 0-6 0C6.8 2.7 5.8 3 5.8 3a4.3 4.3 0 0 0-.1 3.1 4.6 4.6 0 0 0-1.2 3.2c0 4.7 2.8 5.7 5.5 6a3 3 0 0 0-.8 2.3V21',
  clock: 'M12 7v5l3 2m7-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  folder: 'M3 5h6l2 2h10v13H3V5Z',
  leaf: 'M20 3c-7-1-16 2-16 9a6 6 0 0 0 6 6c7 0 10-8 10-15ZM4 21l11-12',
  mail: 'M3 5h18v14H3V5Zm0 0 9 8 9-8',
  check: 'm5 12 4 4L19 6',
  chevron: 'm9 5 7 7-7 7',
  motion: 'M3 8h12a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h5',
  copy: 'M8 8h12v13H8V8ZM4 16H3V3h12v1'
}
</script>
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.leaf" /></svg>
</template>
