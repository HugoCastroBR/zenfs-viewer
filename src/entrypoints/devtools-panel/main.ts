import './app.css'
import App from './App.svelte'
// @ts-ignore
import { mount } from 'svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
