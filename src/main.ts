import './styles/main.css';
import { PulseDeskApp } from './ui/app';

const root = document.querySelector<HTMLElement>('#app');
if (!root) {
  throw new Error('#app root missing');
}

const app = new PulseDeskApp(root);
void app.start();
