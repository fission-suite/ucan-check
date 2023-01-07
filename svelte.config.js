import { resolve } from 'path'
import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-static'
import { mdsvex } from "mdsvex"
import remarkHeadingId from 'remark-heading-id'

// import { plugin: mdPlugin, Mode } from 'vite-plugin-markdown'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    mdsvex({ 
      extensions: ['.md'],
      remarkPlugins: [remarkHeadingId],
      rehypePlugins: []
    }),
    preprocess()
  ],
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html' 
    }),
  }
}

export default config
