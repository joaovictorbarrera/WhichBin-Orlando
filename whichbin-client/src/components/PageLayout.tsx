import type { ReactNode } from 'react'
import './PageLayout.css'

type PageLayoutProps = {
  children: ReactNode
  className?: string
  width?: 'narrow' | 'wide' | 'full'
}

function PageLayout({ children, className = '', width = 'full' }: PageLayoutProps) {
  return (
    <main className={`page-layout page-layout-${width} ${className}`.trim()}>
      {children}
    </main>
  )
}

export default PageLayout
