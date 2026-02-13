import { Card, CardContent, CardHeader } from '@/components/Card'
import Layout from '@/components/Layout'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Layout>
      <Card className='h-full md:w-lg'>
        <CardHeader>
          Terms
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className='flex flex-col gap-2 border-b pb-2'>
            <h1>
              Effective Date: 11.04.2026
            </h1>
          </div>
          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              1. Service Description
            </h1>
            <p className='opacity-80 ml-4'>
              Our platform connects buyers (Demand Side) with suppliers and service providers (Supply Side) using AI-powered matching technology.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              2. User Accounts
            </h1>
            <p className='opacity-80 ml-4'>
              You must provide accurate information when creating an account. You are responsible for maintaining account security. One account per user or business entity.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              3. How It Works
            </h1>
            <Link to="/docs/guide" className="underline ml-4">Read guide</Link> 
            
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              4. Application Fees
            </h1>
            <p className='opacity-80 ml-4'>
              Standard application fee is $149.00 USD per application. All fees are non-refundable once contact information is exchanged. Payment must be completed before contact information is released.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              5. Contact Information Exchange
            </h1>
            <p className='opacity-80 ml-4'>
              Both parties receive each other's contact details upon successful application. You agree to use contact information only for legitimate business purposes. No guarantee of deal completion after contact exchange.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              6. User Responsibilities
            </h1>
            <p className='opacity-80 ml-4'>
              Provide accurate, honest information in all posts. Conduct business dealings ethically and legally. Do not spam, harass, or misuse the platform. Negotiate deals directly with matched parties.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              7. AI Matching
            </h1>
            <p className='opacity-80 ml-4'>
              Match percentages are automated and provided as guidance only. We do not guarantee accuracy of matches or successful deals. Platform does not endorse any specific user or offering.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              8. Platform Role
            </h1>
            <p className='opacity-80 ml-4'>
              We facilitate introductions only. We are not party to any transactions between users. All deals, negotiations, and agreements are between users directly. We are not responsible for disputes, payment issues, or deal failures.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              9. Prohibited Activities
            </h1>
            <p className='opacity-80 ml-4'>
              Posting false or misleading information, circumventing the application fee system, using platform data for purposes other than intended transactions, harassment, discrimination, or illegal activities are strictly prohibited.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              10. Liability
            </h1>
            <p className='opacity-80 ml-4'>
              Platform provided "as is" without warranties. We are not liable for failed deals, misrepresentations, or user disputes. Maximum liability limited to fees paid in past 12 months.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              11. Termination
            </h1>
            <p className='opacity-80 ml-4'>
              We may suspend or terminate accounts for Terms violations. Users may close accounts at any time. No refunds upon termination.
            </p>
          </div>

          <div className='flex flex-col gap-2 border-b pb-4'>
            <h1>
              12. Changes to Terms
            </h1>
            <p className='opacity-80 ml-4'>
              We may update these Terms at any time. Continued use constitutes acceptance of changes.
            </p>
          </div>
          <div className='flex flex-col gap-2 '>
            <h1>
              Governing Law: Poland
            </h1>
          </div>
        </CardContent>
      </Card>
    </Layout>
  )
}