import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'
import { Textarea } from '@/components/Textarea'
import { Button } from '@/components/Button'
import Layout from '@/components/Layout'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LoaderIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { searchDemandQueryOptions } from '@/hooks/useDemand'
import { useState } from 'react'

const searchSchema = z.object({
  q: z.string().optional().default(''),
})

export const Route = createFileRoute('/_authenticated/supply')({
  validateSearch: searchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { q: urlSearchQuery } = Route.useSearch()
  
  // Local state for the textarea
  const [searchInput, setSearchInput] = useState(urlSearchQuery)

  // Use the URL search query for the actual API call
  const { data: results, isLoading, error, isFetching } = useQuery(
    searchDemandQueryOptions(urlSearchQuery)
  )

  const handleSearch = () => {
    if (searchInput.trim().length >= 30) {
      navigate({ 
        to: '.',
        search: { q: searchInput.trim() },
        replace: true 
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
  const validResults = results?.filter(result => result.demand != null) || [];

  return (
    <Layout>
      <Card className='h-full md:w-md'>
        <CardHeader className='flex gap-2 flex-col'>
          <Textarea 
            autoFocus
            placeholder="I have a 3 bedroom apartment in Warsaw for a family..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            className='resize-none'
          />
          <p className='text-xs text-muted-foreground'>
            {searchInput.trim().length}/30 characters minimum
          </p>
          <Button 
            onClick={handleSearch}
            disabled={searchInput.trim().length < 30 || isLoading || isFetching}
            className='w-full shrink-0'
          >
            {isLoading || isFetching ? 'Searching...' : 'Search'}
          </Button>
        </CardHeader>
      

        <CardContent>
          {(isLoading || isFetching) && urlSearchQuery.length >= 30 ? (
            <div className='h-full w-full flex items-center justify-center'>
              <LoaderIcon className='shrink-0 animate-spin' size={16} />
            </div>
          ) : error ? (
            <p className='text-red-500'>Error: {error.message}</p>
          ) : !urlSearchQuery || urlSearchQuery.length < 30 ? (
            <p className='text-muted-foreground text-sm'>
              Enter at least 30 characters and click Search to find matching demands
            </p>
          ) : validResults.length > 0 ? (
            <div className='space-y-2'>
              {validResults.map((result) => {
                return (
                  <div
                    key={result.demand.id}
                    className='p-2 border border-primary cursor-pointer space-y-2'
                    onClick={() => navigate({ 
                      to: '/demand/$demandId', 
                      params: { demandId: result.demand.id.toString() } 
                    })}
                  >
                    <div className='flex justify-between items-start'>
                      <p className='text-sm'>
                        Match Score: {(result.score * 100).toFixed(1)}%
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {new Date(result.demand.createdAt * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <p className=''>{result.demand.content}</p>
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