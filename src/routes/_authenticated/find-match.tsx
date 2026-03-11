import Loader from '@/components/Loader'
import Page from '@/components/Page'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import z from 'zod'
import { useAuth } from '../-auth'
import { useEffect, useState } from 'react'
import { rateLimitStatusQueryOptions, searchDemandQueryOptions } from '@/hooks/useDemand'
import { Textarea } from '@/components/Textarea'
import { Button } from '@/components/Button'
import { useLanguage } from '@/providers/language-provider'

const searchSchema = z.object({
  q: z.string().optional().default(''),
})

const STORAGE_KEY = 'supplySearchQuery'

export const Route = createFileRoute('/_authenticated/find-match')({
  pendingComponent: () => <Loader />,
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { q: urlSearchQuery } = Route.useSearch()
  const { user } = useAuth()

  // Local state for the textarea
  const [searchInput, setSearchInput] = useState('')
  const [rateLimitError, setRateLimitError] = useState<string | null>(null)
  
  // Load from localStorage on mount
  useEffect(() => {
    const savedQuery = localStorage.getItem(STORAGE_KEY)
    if (savedQuery) {
      setSearchInput(savedQuery)
    } else if (urlSearchQuery) {
      setSearchInput(urlSearchQuery)
    }
  }, [])

  // Update localStorage when input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setSearchInput(value)
    localStorage.setItem(STORAGE_KEY, value)
  }

  // Validation variables
  const trimmedSearch = searchInput.trim()
  const isValidSearch =
    trimmedSearch.length >= 30 && trimmedSearch.length <= 500

  // Fetch rate limit status
  const { data: rateLimitStatus } = useQuery(
    rateLimitStatusQueryOptions(user?.id || ''),
  )

  // Use the URL search query for the actual API call
  const {
    data: searchResponse,
    isLoading,
    error,
    isFetching,
  } = useQuery(searchDemandQueryOptions(urlSearchQuery, user?.id || ''))

  // Update rate limit status after search
  useEffect(() => {
    if (searchResponse?.rateLimit) {
      queryClient.setQueryData(
        ['rateLimit', 'status', user?.id],
        searchResponse.rateLimit,
      )
    }
  }, [searchResponse, queryClient, user?.id])

  // Check for rate limit errors
  useEffect(() => {
    if (error?.message.includes('Daily search limit reached')) {
      setRateLimitError(error.message)
    } else {
      setRateLimitError(null)
    }
  }, [error])

  const handleSearch = () => {
    if (isValidSearch) {
      setRateLimitError(null)
      navigate({
        to: '.',
        search: { q: trimmedSearch },
        replace: true,
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  // Filter out results where demand is null/undefined
  const validResults =
    searchResponse?.demand?.filter((result) => result.demand != null) || []

  const currentRateLimit = searchResponse?.rateLimit ||
    rateLimitStatus || { remaining: 10, total: 10, resetAt: '' }
  const isLimitReached = currentRateLimit.remaining === 0

  return (
    <Page header={t('findMatchWelcome')}>    
      <Textarea
        autoFocus
        placeholder={t('findMatchQuery')}
        value={searchInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={3}
        className="resize-none shrink-0"
      />
      <Button
        onClick={handleSearch}
        disabled={!isValidSearch || isLoading || isFetching || isLimitReached}
        className="w-full shrink-0"
      >
        {isLoading || isFetching
          ? t('searching')
          : isLimitReached
            ? t('dailyLimitReached')
            : `${t('search')} — ${t('leftToday')} ${currentRateLimit.remaining} ${t('leftTodaySub')}`}
      </Button>

      <div className=''>
        {(isLoading || isFetching) && urlSearchQuery.length >= 30 ? (
          <div className="h-full w-full flex items-center justify-center">
            <p>{t('wait')}</p>
          </div>
        ) : rateLimitError ? (
          <p className="text-primary/70">{rateLimitError}</p>
        ) : error ? (
          <p className="text-primary/70">Error: {error.message}</p>
        ) : !urlSearchQuery ||
          urlSearchQuery.length < 30 ? null : validResults.length > 0 ? (
          <div className="space-y-4">
            {validResults.map((result, index) => {
              return (
                <div 
                  className="cursor-pointer"
                  onClick={() => navigate({ to: `/demand/${result.demand.id}` })}
                >
                  <div className="flex items-center">
                    <span>[{index + 1}]</span>
                    <span>[{(result.score * 100).toFixed(2)}%]</span>
                  </div>
                  <p className="opacity-70 min-w-0 wrap-break-word">
                    {result.demand.content.length > 256
                      ? `${result.demand.content.slice(0, 256)}…`
                      : result.demand.content}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <p>{t('noDemandsFound')}</p>
        )}
      </div>
    </Page>
  )
}
