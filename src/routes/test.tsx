import { Card, CardContent } from '@/components/Card'
import LocationSelect from '@/components/Earth'
import Layout from '@/components/Layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Layout>
      <Card>
        <CardContent>
          <LocationSelect />
        </CardContent>
      </Card>
    </Layout>
  )
}
