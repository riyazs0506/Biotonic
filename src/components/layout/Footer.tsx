import { Link } from 'react-router';
import { show } from '../../content/pending';
import { site } from '../../content/site';
import { footerNav, paths, visible } from '../../lib/routes';
import { Logo } from '../brand/Logo';
import { Icon } from '../ui/Icon';
import { Confirm } from '../ui/Pending';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();
  const legalName = show(site.legalName) ?? site.brandName;

  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <Link to={paths.home} className={styles.logoLink} aria-label="Biotonic — home">
              <Logo variant="reversed" height={30} alt="" />
            </Link>
            <p className={`display ${styles.tagline}`}>
              Chemistry you can trust, <em>at first glance.</em>
            </p>
            <address className={styles.contact}>
              <Confirm
                value={site.email}
                render={(email) => (
                  <a href={`mailto:${email}`} className={styles.contactLink}>
                    <Icon name="mail" size={18} /> {email}
                  </a>
                )}
              />
              <Confirm
                value={site.phone}
                render={(phone) => (
                  <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={styles.contactLink}>
                    <Icon name="phone" size={18} /> {phone}
                  </a>
                )}
              />
              <Confirm
                value={site.address}
                render={(lines) => (
                  <span className={styles.contactLink}>
                    <Icon name="pin" size={18} /> {lines.join(', ')}
                  </span>
                )}
              />
            </address>
          </div>

          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading} className={styles.col}>
              <h2 className={styles.colTitle}>{group.heading}</h2>
              <ul className={styles.links}>
                {visible(group.items).map((item) => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className={styles.bottom}>
          <p>
            © {year} {legalName}. All rights reserved.
          </p>
          <Confirm
            value={site.social}
            render={(links) =>
              links.length > 0 && (
                <ul className={styles.social}>
                  {links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} rel="noopener noreferrer" target="_blank">
                        {l.label}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )
            }
          />
        </div>
      </div>
    </footer>
  );
}
