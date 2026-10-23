import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { paths, primaryNav, visible } from '../../lib/routes';
import { Logo } from '../brand/Logo';
import { ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';
import styles from './Header.module.css';

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const nav = visible(primaryNav);

  // Close the mobile menu whenever the route changes.
  const [lastPath, setLastPath] = useState(location.pathname);
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname);
    setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile drawer: lock scroll, trap focus, close on Escape, restore focus on close.
  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const toggle = toggleRef.current;
    document.body.style.overflow = 'hidden';
    const focusables = () =>
      Array.from(drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusables()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [toggle, ...focusables()].filter((el): el is HTMLElement => Boolean(el));
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      toggle?.focus();
    };
  }, [open]);

  return (
    <header
      className={[styles.header, (scrolled || open) && styles.scrolled, open && styles.open]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.inner}>
        <Link to={paths.home} className={styles.brand} aria-label="Biotonic — home">
          <Logo variant="continuous" height={26} alt="" priority />
        </Link>

        <nav aria-label="Primary" className={styles.desktopNav}>
          <ul className={styles.navList}>
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <ButtonLink to={paths.quote} className={styles.cta} icon="arrowRight">
            Request a Quote
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            className={styles.menuButton}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
            <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={drawerRef}
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        hidden={!open}
      >
        <nav aria-label="Mobile">
          <ul className={styles.drawerList}>
            {[{ label: 'Home', to: paths.home }, ...nav].map((item, i) => (
              <li key={item.to}>
                <NavLink to={item.to} end className={styles.drawerLink}>
                  <span className={styles.drawerIndex}>{String(i + 1).padStart(2, '0')}</span>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <ButtonLink to={paths.quote} size="lg" icon="arrowRight" className={styles.drawerCta}>
          Request a Quote
        </ButtonLink>
      </div>
    </header>
  );
}
