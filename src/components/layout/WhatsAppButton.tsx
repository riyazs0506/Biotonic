import { whatsappHref } from '../../lib/whatsapp';
import { Icon } from '../ui/Icon';
import styles from './WhatsAppButton.module.css';

/** Floating quick-quote link — WhatsApp-first service, per the brand strategy. */
export function WhatsAppButton() {
  const href = whatsappHref();
  if (!href) return null;
  return (
    <aside aria-label="Quick contact">
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.button}>
        <Icon name="chat" size={20} />
        <span className={styles.label}>WhatsApp us</span>
        <span className="visually-hidden"> for a quick quote (opens in a new tab)</span>
      </a>
    </aside>
  );
}
