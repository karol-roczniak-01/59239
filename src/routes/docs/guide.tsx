import { Link, createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader } from '@/components/Card'
import Layout from '@/components/Layout'

export const Route = createFileRoute('/docs/guide')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Layout>
      <Card className="h-full md:w-lg">
        <CardHeader>Guide</CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>In a Few Words</h1>
            <p className="opacity-80 ml-4">
              5-92-39 is a place where demand and supply find each other, and
              suppliers can apply to demand listings to connect with qualified
              leads. Think of it as a mini tender-like platform.
            </p>
          </div>
          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>I&apos;m Looking to Buy Something</h1>
            <p className="opacity-80 ml-4">
              1. Go to{' '}
              <Link to="/demand/new" className="underline">
                /demand/new
              </Link>{' '}
              and specify in as much detail as possible what you need. A good
              example would be:
            </p>
            <span className="border p-2 opacity-80 text-sm ml-4">
              Precision CNC milling for aerospace aluminum parts. Tolerances
              ±0.0005", typical part size 8"×6"×3", production runs 50-200 units
              monthly. Must hold ISO 9001 and AS9100 certifications. Require
              5-axis capability for complex geometries.
            </span>
            <p className="opacity-80 ml-4">
              2. Provide contact details and duration, then click 'Create' (It
              takes a moment!).
            </p>
            <p className="opacity-80 ml-4">
              3. Your demand listing will be available at{' '}
              <Link to="/demand" className="underline">
                /demand
              </Link>
              . You can open it to see current applications with contact
              details.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h1>I Want to Sell Something</h1>
            <p className="opacity-80 ml-4">
              1. Go to{' '}
              <Link to="/supply/new" className="underline">
                /supply/new
              </Link>{' '}
              and specify your offer. A good example would be:
            </p>
            <span className="border p-2 opacity-80 text-sm ml-4">
              We are an ISO 9001 & AS9100 certified precision CNC shop
              specializing in aerospace components. Full inspection services
              with FAI/PPAP documentation. Located in Southern California.
            </span>
            <p className="opacity-80 ml-4">
              2. Click Search and see AI-matched demands.
            </p>
            <p className="opacity-80 ml-4">
              3. Open a demand that looks interesting and click 'Apply'.
            </p>
            <p className="opacity-80 ml-4">
              4. Write a message for the potential buyer, provide your contact
              details, and click 'Continue to Payment'.
            </p>
            <p className="opacity-80 ml-4">
              5. Enter your card details and proceed.
            </p>
            <p className="opacity-80 ml-4">
              6. You can see your current applications at{' '}
              <Link to="/supply" className="underline">
                /supply
              </Link>
              . You can open each one to see the buyer contact details for
              demands you applied to.
            </p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  )
}
