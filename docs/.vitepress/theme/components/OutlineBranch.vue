<script setup lang="ts">
export interface OutlineHeading { title: string; slug: string; children: OutlineHeading[] }
defineProps<{ headings: OutlineHeading[]; expanded: Set<string>; active: string }>()
const emit = defineEmits<{ toggle: [slug: string]; select: [slug: string] }>()
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
          @click="emit('select', heading.slug)">{{ heading.title }}</a>
      </div>
      <div v-if="heading.children.length" class="outline-children"
        :class="{ 'is-expanded': expanded.has(heading.slug) }"
        :inert="!expanded.has(heading.slug)" :aria-hidden="!expanded.has(heading.slug)">
        <div class="outline-children-inner">
          <OutlineBranch :headings="heading.children" :expanded="expanded" :active="active"
            @toggle="emit('toggle', $event)" @select="emit('select', $event)" />
        </div>
      </div>
    </li>
  </ul>
</template>
