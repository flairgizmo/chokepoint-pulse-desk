import './styles/main.css';
import { QntDesk } from './ui/app';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('#app root missing');

try {
  new QntDesk(root).start();
} catch (err) {
  console.error(err);
  root.innerHTML =
    '<div class="boot"><p>QntDesk could not start. Refresh the page.</p></div>';
}
