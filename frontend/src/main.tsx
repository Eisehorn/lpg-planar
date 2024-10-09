import { createRoot } from 'react-dom/client'
import App from './App'

	console.log("Debugging from main.tsx pre");
createRoot(document.getElementById('root')!).render(
<App />,
)
	console.log("Debugging from main.tsx after");
