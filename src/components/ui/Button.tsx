import type { ButtonHTMLAttributes } from 'react'
import { buttonClasses } from '@/lib/buttonStyles'
import type { ButtonSize, ButtonVariant } from '@/lib/buttonStyles'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...rest} />
  )
}
