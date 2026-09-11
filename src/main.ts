import './styles/main.css';
import { QntDesk } from './ui/app';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('#app root missing');

new QntDesk(root).start();
