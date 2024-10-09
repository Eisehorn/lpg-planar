import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()], server: {
        watch: {
            usePolling: true,
        },
        host: true,
        strictPort: true,
        port: 6969
    }
})
