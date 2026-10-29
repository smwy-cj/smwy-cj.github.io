<script setup lang="ts">
export interface OutlineHeading { title: string; slug: string; children: OutlineHeading[] }
defineProps<{ headings: OutlineHeading[]; expanded: Set<string>; active: string }>()
const emit = defineEmits<{ toggle: [slug: string]; expand: [slug: string] }>()
</script>

<template>
  <ul class="outline-list">
    <li v-for="heading in headings" :key="heading.slug">
      <div class="outline-row">
        <button v-if="heading.children.length" class="outline-toggle"
          :aria-label="`${expanded.has(heading.slug) ? '收起' : '展开'} ${heading.title}`"
          :aria-expanded="expanded.has(heading.slug)" @click="emit('toggle', heading.slug)">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5" /></svg>
        </button>
        <span v-else class="outline-spacer" aria-hidden="true" />
        <a :href="`#${heading.slug}`" :aria-current="active === heading.slug ? 'location' : undefined"
          @click="emit('expand', heading.slug)">{{ heading.title }}</a>
      </div>
      <Transition name="outline-reveal">
        <OutlineBranch v-if="heading.children.length && expanded.has(heading.slug)"
          :headings="heading.children" :expanded="expanded" :active="active"
          @toggle="emit('toggle', $event)" @expand="emit('expand', $event)" />
      </Transition>
    </li>
  </ul>
</template>
