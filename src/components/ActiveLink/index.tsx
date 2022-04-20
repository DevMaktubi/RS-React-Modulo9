import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import {ReactElement, cloneElement} from 'react'

interface ActiveLinkProps extends LinkProps {
  children: ReactElement;
  activeClassname: string;
}

export function ActiveLink({children, activeClassname, ...rest}: ActiveLinkProps) {
  const {asPath} = useRouter();

  const classname = asPath === rest.href ? activeClassname : '';
  return (
    <Link href={activeClassname} {...rest}>
      {cloneElement(children, {className: classname})}
    </Link>
  )
}