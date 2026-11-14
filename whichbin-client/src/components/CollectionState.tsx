import type { ReactNode } from 'react'
import { FiInbox, FiLoader, FiRefreshCw } from 'react-icons/fi'
import './CollectionState.css'

type Props = {
  state: 'loading' | 'error' | 'empty'
  name: string
  description?: ReactNode
  onRetry?: () => void
  children?: ReactNode
}

export default function CollectionState({ state, name, description, onRetry, children }: Props) {
  if (state === 'error') {
    return (
      <div className="collection-error" role="alert">
        <p>{name.charAt(0).toUpperCase() + name.slice(1)} could not be loaded. Check your connection and try again.</p>
        {onRetry && <button type="button" onClick={onRetry}><FiRefreshCw aria-hidden="true" />Try Again</button>}
      </div>
    )
  }

  const Icon = state === 'loading' ? FiLoader : FiInbox
  const title = state === 'loading' ? `Loading ${name}...` : `No ${name} found`

  return (
    <div className={`collection-state collection-state--${state}`} role="status" aria-busy={state === 'loading'}>
      <Icon className="collection-state__icon" aria-hidden="true" />
      <h2>{title}</h2>
      {state !== 'loading' && description !== null && <p>{description ?? 'Check back later for updates.'}</p>}
      {children}
    </div>
  )
}
