import { Button } from '@/components/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'
import { Input } from '@/components/Input'
import Layout from '@/components/Layout'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LoaderIcon, Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { humansByNameQueryOptions, organizationsByNameQueryOptions } from '@/hooks/useUsers'
import { z } from 'zod'

const searchSchema = z.object({
q: z.string().optional().default(''),
mode: z.enum(['humans', 'organizations']).optional().default('humans'),
})

export const Route = createFileRoute('/\_authenticated/users')({
validateSearch: searchSchema,
component: RouteComponent,
})

type ViewMode = 'humans' | 'organizations'

function RouteComponent() {
const navigate = useNavigate();
const { q: searchTerm, mode: viewMode } = Route.useSearch()

// Debounce the search term to avoid excessive API calls
const debouncedSearchTerm = useDebounce(searchTerm, 300)

// Use the debounced value for queries
const humansQuery = useQuery(humansByNameQueryOptions(debouncedSearchTerm))
const orgsQuery = useQuery(organizationsByNameQueryOptions(debouncedSearchTerm))

// Select which query to display based on view mode
const activeQuery = viewMode === 'humans' ? humansQuery : orgsQuery
const { data: users, isLoading, error, isFetching } = activeQuery

const updateSearch = (newSearchTerm: string) => {
navigate({
to: '.',
search: { q: newSearchTerm, mode: viewMode },
replace: true
})
}

const updateViewMode = (newMode: ViewMode) => {
navigate({
to: '.',
search: { q: searchTerm, mode: newMode },
replace: true
})
}

return (
<Layout>
<Card className='h-full md:w-md'>
<CardHeader className='relative'>
<Search size={16} className='absolute top-4 left-4'/>
<Input
className='pl-7'
autoFocus
placeholder={`Search ${viewMode}...`}
value={searchTerm}
onChange={(e) => updateSearch(e.target.value)}
/>
</CardHeader>

        <CardContent>
          {(isLoading || isFetching) && debouncedSearchTerm.length > 1 ? (
            <div className='h-full w-full flex items-center justify-center'>
              <LoaderIcon className='shrink-0 animate-spin' size={16} />
            </div>
          ) : error ? (
            <p className='text-primary/70'>Error: {error.message}</p>
          ) : !debouncedSearchTerm || debouncedSearchTerm.length <= 1 ? (
            null
          ) : users && users.length > 0 ? (
            <div className='grid grid-cols-2'>
              {users.map((user) => (
                <div
                  key={user.id}
                  className='p-2 border border-border cursor-pointer hover:bg-accent'
                  onClick={() => navigate({
                    to: '/user/$name',
                    params: { name: user.name }
                  })}
                >
                  {user.name}
                </div>
              ))}
            </div>
          ) : (
            <p>No {viewMode} found</p>
          )}
        </CardContent>

        <CardFooter className='flex gap-2'>
          <Button
            className={`w-full ${viewMode === 'humans' && 'opacity-50 pointer-events-none'}`}
            onClick={() => updateViewMode('humans')}
          >
            People
          </Button>
          <Button
            className={`w-full ${viewMode === 'organizations' && 'opacity-50 pointer-events-none'}`}
            onClick={() => updateViewMode('organizations')}
          >
            Organizations
          </Button>
        </CardFooter>
      </Card>
    </Layout>

)
}
