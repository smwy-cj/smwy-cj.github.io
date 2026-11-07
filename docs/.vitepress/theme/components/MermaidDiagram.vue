<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
const props = defineProps<{ source: string }>()
const svg = ref('')
const error = ref(false)
let revision = 0
async function render() {
  const current = ++revision
  error.value = false
  try {
    const { default: mermaid } = await import('mermaid')
    await document.fonts.ready
    mermaid.initialize({
      startOnLoad: false, securityLevel: 'strict', theme: 'base', suppressErrorRendering: true,
      // SVG labels avoid foreignObject sizing and inherited article typography.
      htmlLabels: false,
      flowchart: { htmlLabels: false, nodeSpacing: 28, rankSpacing: 40, useMaxWidth: true },
      themeVariables: {
        fontFamily: 'Arial, "Microsoft YaHei", sans-serif', fontSize: '15px',
        primaryColor: '#eef5f1', primaryTextColor: '#303833', primaryBorderColor: '#8eafa0',
        lineColor: '#687e70', secondaryColor: '#f6f8f7', tertiaryColor: '#dfebe4',
      },
    })
    const result = await mermaid.render(`diagram-${crypto.randomUUID()}`, props.source)
    if (current === revision) svg.value = result.svg
  } catch {
    if (current === revision) { error.value = true; svg.value = '' }
  }
}
onMounted(render)
watch(() => props.source, render)
</script>
<template>
  <figure class="mermaid-diagram" aria-label="架构图">
    <div v-if="svg" v-html="svg" />
    <template v-else><p role="status">{{ error ? '图表暂时无法显示，请检查 Mermaid 语法。' : '正在绘制图表…' }}</p><pre>{{ source }}</pre></template>
    <details v-if="svg"><summary>查看图表源码</summary><pre>{{ source }}</pre></details>
  </figure>
</template>
