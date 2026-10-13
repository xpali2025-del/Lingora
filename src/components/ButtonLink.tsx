import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';

type ButtonLinkProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement>
>;

export function ButtonLink({
  children,
  className = '',
  ...props
}: ButtonLinkProps) {
  return (
    <a className={`button-link ${className}`.trim()} {...props}>
      {children}
    </a>
  );
}
