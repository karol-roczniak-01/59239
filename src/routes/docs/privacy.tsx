import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader } from '@/components/Card'
import Layout from '@/components/Layout'

export const Route = createFileRoute('/docs/privacy')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Layout>
      <Card className="h-full md:w-lg">
        <CardHeader>Privacy Policy</CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 border-b pb-2">
            <h1>Effective Date: February 16, 2026</h1>
            <p className="opacity-80 ml-4">
              This Privacy Policy describes how 5-92-39 ("we," "us," or "our")
              collects, uses, and protects your personal information when you
              use our B2B marketplace platform that connects buyers with
              suppliers and service providers.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>1. Information We Collect</h1>
            <h2 className="ml-4">1.1 Information You Provide</h2>
            <p className="opacity-80 ml-4">
              When you use our platform, you provide:
            </p>
            <ul className="opacity-80 ml-8 list-disc space-y-1">
              <li>Account information (email, business details)</li>
              <li>
                Contact information (name, email, phone number) for
                demand/supply listings
              </li>
              <li>Business details in your demand and supply posts</li>
              <li>
                Payment information (processed securely through our payment
                provider)
              </li>
            </ul>

            <h2 className="ml-4 mt-3">
              1.2 Automatically Collected Information
            </h2>
            <p className="opacity-80 ml-4">We automatically collect:</p>
            <ul className="opacity-80 ml-8 list-disc space-y-1">
              <li>
                Authentication data (auth_token cookie for maintaining your
                login session)
              </li>
              <li>Usage data (pages visited, features used)</li>
              <li>
                Technical information (browser type, IP address, device
                information)
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>2. How We Use Your Information</h1>
            <p className="opacity-80 ml-4">We use your information to:</p>
            <ul className="opacity-80 ml-8 list-disc space-y-1">
              <li>Provide and maintain our platform services</li>
              <li>
                Process applications and facilitate connections between buyers
                and suppliers
              </li>
              <li>
                Match demand and supply listings using AI-powered technology
              </li>
              <li>Process payments for application fees</li>
              <li>Authenticate and maintain your account security</li>
              <li>Communicate with you about your account and applications</li>
              <li>Improve our platform and develop new features</li>
              <li>Prevent fraud and ensure platform security</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>3. Information Sharing</h1>
            <h2 className="ml-4">3.1 With Other Users</h2>
            <p className="opacity-80 ml-4">
              When you apply to a demand listing or when someone applies to your
              demand, contact information is exchanged between both parties.
              This is the core functionality of our platform and is done with
              your explicit consent when you submit an application or create a
              demand listing.
            </p>

            <h2 className="ml-4 mt-3">3.2 With Service Providers</h2>
            <p className="opacity-80 ml-4">
              We share information with third-party service providers who help
              us operate our platform:
            </p>
            <ul className="opacity-80 ml-8 list-disc space-y-1">
              <li>Payment processors (for handling application fees)</li>
              <li>Hosting providers (Cloudflare)</li>
              <li>AI service providers (for matching algorithms)</li>
            </ul>

            <h2 className="ml-4 mt-3">3.3 Legal Requirements</h2>
            <p className="opacity-80 ml-4">
              We may disclose your information if required by law or to protect
              our rights, comply with legal processes, or respond to valid
              government requests.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>4. Cookies and Tracking</h1>
            <p className="opacity-80 ml-4">
              We use a single essential cookie (auth_token) to maintain your
              login session. This cookie is strictly necessary for the platform
              to function and does not require your consent under applicable
              privacy laws.
            </p>
            <p className="opacity-80 ml-4">
              We do not use tracking cookies, analytics cookies, or advertising
              cookies.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>5. Data Security</h1>
            <p className="opacity-80 ml-4">
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the internet is 100% secure, and we cannot
              guarantee absolute security.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>6. Data Retention</h1>
            <p className="opacity-80 ml-4">
              We retain your personal information for as long as your account is
              active or as needed to provide services. Demand and supply
              listings are retained for the duration specified when created.
              After account closure, we may retain certain information as
              required by law or for legitimate business purposes.
            </p>
            <p className="opacity-80 ml-4">
              Contact information exchanged through applications remains
              accessible to both parties and is not deleted when accounts are
              closed.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>7. Your Rights</h1>
            <p className="opacity-80 ml-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="opacity-80 ml-8 list-disc space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>
                Request deletion of your information (subject to legal
                obligations)
              </li>
              <li>Object to processing of your information</li>
              <li>Request data portability</li>
            </ul>
            <p className="opacity-80 ml-4 mt-2">
              To exercise these rights, please contact us using the information
              provided below. Note that contact information already exchanged
              with other users cannot be retrieved or deleted from their
              records.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>8. International Data Transfers</h1>
            <p className="opacity-80 ml-4">
              Your information may be transferred to and processed in countries
              other than your country of residence. We ensure appropriate
              safeguards are in place for such transfers in accordance with
              applicable data protection laws.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>9. Children&apos;s Privacy</h1>
            <p className="opacity-80 ml-4">
              Our platform is designed for business use and is not intended for
              individuals under 18 years of age. We do not knowingly collect
              information from children.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>10. Changes to This Privacy Policy</h1>
            <p className="opacity-80 ml-4">
              We may update this Privacy Policy from time to time. We will
              notify you of material changes by posting the new policy on our
              platform with an updated effective date. Your continued use of the
              platform after changes constitutes acceptance of the updated
              policy.
            </p>
          </div>

          <div className="flex flex-col gap-2 border-b pb-4">
            <h1>11. Contact Us</h1>
            <p className="opacity-80 ml-4">
              If you have questions about this Privacy Policy or our data
              practices, please contact us at: help@19188103.com
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h1>12. Governing Law</h1>
            <p className="opacity-80 ml-4">
              This Privacy Policy is governed by the laws of Poland. As we
              operate from Poland, we comply with EU GDPR requirements.
            </p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  )
}
