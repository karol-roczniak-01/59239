import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/Card'
import { Textarea } from '@/components/Textarea'
import { Button } from '@/components/Button'
import Layout from '@/components/Layout'
import {
  rateLimitStatusQueryOptions,
  searchDemandQueryOptions,
} from '@/hooks/useDemand'
import { useAuth } from '@/routes/-auth'

const searchSchema = z.object({
  q: z.string().optional().default(''),
})

const STORAGE_KEY = 'supplySearchQuery'

export const Route = createFileRoute('/_authenticated/supply/new')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
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
    <Layout>
      <Card className="h-full md:w-lg">
        <CardHeader className="flex gap-2 flex-col">
          <p>New Supply</p>
          <Textarea
            autoFocus
            placeholder="I'm an authorized distributor of refurbished Siemens & GE 1.5T MRS systems for outpatient facilities. Inventory includes musculoskeletal imaging packages All units FDA-cleared with warranty."
            value={searchInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-between items-center text-xs">
            <p className="text-muted-foreground">
              {trimmedSearch.length}/500 characters (minimum 30)
            </p>
            <p
              className={`f ${isLimitReached ? 'text-primary/70' : 'text-muted-foreground'}`}
            >
              {currentRateLimit.remaining}/{currentRateLimit.total} searches
              remaining today
            </p>
          </div>
          {rateLimitError && (
            <p className="text-xs text-primary/70">
              {rateLimitError} Resets at{' '}
              {new Date(currentRateLimit.resetAt).toLocaleTimeString()}
            </p>
          )}
          <Button
            onClick={handleSearch}
            disabled={
              !isValidSearch || isLoading || isFetching || isLimitReached
            }
            className="w-full shrink-0"
          >
            {isLoading || isFetching
              ? 'Searching...'
              : isLimitReached
                ? 'Daily limit reached'
                : 'Search'}
          </Button>
        </CardHeader>

        <CardContent>
          {(isLoading || isFetching) && urlSearchQuery.length >= 30 ? (
            <div className="h-full w-full flex items-center justify-center">
              <p>Wait...</p>
            </div>
          ) : rateLimitError ? (
            <p className="text-primary/70">{rateLimitError}</p>
          ) : error ? (
            <p className="text-primary/70">Error: {error.message}</p>
          ) : !urlSearchQuery ||
            urlSearchQuery.length < 30 ? null : validResults.length > 0 ? (
            <div className="space-y-2">
              {validResults.map((result) => {
                return (
                  <div
                    key={result.demand.id}
                    className="p-2 border border-primary cursor-pointer space-y-2"
                    onClick={() =>
                      navigate({
                        to: '/demand/$demandId',
                        params: { demandId: result.demand.id.toString() },
                      })
                    }
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm">
                        Match Score: {(result.score * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(
                          result.demand.createdAt * 1000,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="">{result.demand.content}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p>No matching demands found</p>
          )}
        </CardContent>
      </Card>
    </Layout>
  )
}
