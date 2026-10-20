import type { Theme } from 'vitepress'
import Layout from './Layout.vue'
import './styles.css'
import MermaidDiagram from './components/MermaidDiagram.vue'

export default {
  Layout,
  enhanceApp({ app }) { app.component('MermaidDiagram', MermaidDiagram) }
} satisfies Theme
