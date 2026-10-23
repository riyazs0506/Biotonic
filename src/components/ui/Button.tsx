import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { Icon, type IconName } from './Icon';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse' | 'inverse-outline';
type Size = 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  children: ReactNode;
  className?: string;
}

function classes({ variant = 'primary', size = 'md', className }: CommonProps) {
  return [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');
}

function Content({ icon, children }: Pick<CommonProps, 'icon' | 'children'>) {
  return (
    <>
      <span className={styles.label}>{children}</span>
      {icon && <Icon name={icon} size={18} className={styles.icon} />}
    </>
  );
}

export function ButtonLink(props: CommonProps & Omit<LinkProps, 'className' | 'children'>) {
  const { variant, size, icon, children, className, ...rest } = props;
  return (
    <Link className={classes({ variant, size, className, children })} {...rest}>
      <Content icon={icon}>{children}</Content>
    </Link>
  );
}

export function Button(
  props: CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'>,
) {
  const { variant, size, icon, children, className, type = 'button', ...rest } = props;
  return (
    <button type={type} className={classes({ variant, size, className, children })} {...rest}>
      <Content icon={icon}>{children}</Content>
    </button>
  );
}
