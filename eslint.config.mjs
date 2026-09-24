// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  // Templates are kept compact on purpose; don't force one attribute/element per line
  rules: {
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off'
  }
})
