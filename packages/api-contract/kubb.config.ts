import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginClient } from '@kubb/plugin-client'
import { pluginReactQuery } from '@kubb/plugin-react-query'

export default defineConfig({
  root: '.',
  input: {
    path: 'http://localhost:8080/openapi/json',
  },
  output: {
    path: './src/gen',
    clean: true,
  },
  plugins: [
    pluginOas(),
    pluginTs({
      output: { path: 'models' },
      // Exclui rotas de social auth do Better Auth que causam crash por `type: ["array", "null"]`
      exclude: [
        { type: 'path', pattern: /^\/auth\/sign-in\/social/ },
        { type: 'path', pattern: /^\/auth\/link-social-account/ },
      ],
    }),
    pluginClient({
      output: { path: 'clients' },
    }),
    pluginReactQuery({
      output: { path: 'hooks' },
    }),
  ],
})
