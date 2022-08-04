const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.ts',
      title: 'Popup'
    }
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background.ts'
        }
      }
    }
  }
})
