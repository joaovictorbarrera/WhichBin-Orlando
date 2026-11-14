import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import DetailStatus from './DetailStatus'
import { ApiResponseError, isNotFoundError } from '../helpers/ErrorHelper'

describe('DetailStatus', () => {
  it('renders the shared loading state', () => {
    render(
      <DetailStatus
        featureName="item"
        status="loading"
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByText('Loading item details...')).toBeInTheDocument()
  })

  it('renders not found without a button', () => {
    render(
      <DetailStatus
        featureName="resource"
        status="not-found"
        onRetry={vi.fn()}
      />
    )

    expect(screen.getByRole('heading', { name: 'Resource Not Found' })).toBeInTheDocument()
    expect(
      screen.getByText('The requested resource could not be found.')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the failed state and retries when requested', () => {
    const onRetry = vi.fn()
    render(
      <DetailStatus
        featureName="announcement"
        status="failed"
        onRetry={onRetry}
      />
    )

    expect(screen.getByRole('heading', { name: 'Unexpected Error' })).toBeInTheDocument()
    expect(
      screen.getByText(
        'An error occurred loading this announcement. Check your connection and try again.'
      )
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})

describe('isNotFoundError', () => {
  it('only treats HTTP 404 responses as not found', () => {
    expect(isNotFoundError(new ApiResponseError(404, 'not found'))).toBe(true)
    expect(isNotFoundError(new ApiResponseError(500, 'server error'))).toBe(false)
    expect(isNotFoundError(new Error('network error'))).toBe(false)
  })
})
