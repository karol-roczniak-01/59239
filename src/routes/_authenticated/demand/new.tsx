import { Button } from '@/components/Button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/Card'
import Layout from '@/components/Layout'
import { Textarea } from '@/components/Textarea'
import { Input } from '@/components/Input'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCreateDemand } from '@/hooks/useDemand'
import { useState } from 'react'

export const Route = createFileRoute('/_authenticated/demand/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const [content, setContent] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [days, setDays] = useState('30')
  const navigate = useNavigate()
  const { mutate: createDemand, isPending, error } = useCreateDemand()

  const daysNum = parseInt(days) || 0;
  const trimmedContent = content.trim();
  const trimmedEmail = email.trim();
  const isValidDays = daysNum >= 1 && daysNum <= 180;
  const isValidContent = trimmedContent.length >= 50 && trimmedContent.length <= 1000;

  const handleSubmit = () => {
    if (!trimmedContent || !trimmedEmail || !isValidContent || !isValidDays) return
    createDemand(
      { 
        content: trimmedContent,
        email: trimmedEmail,
        phone: phone.trim() || undefined,
        userId: auth.user!.id,
        days: daysNum
      },
      {
        onSuccess: () => {
          setContent('')
          setEmail('')
          setPhone('')
          setDays('30')
          navigate({ to: '/' })
        },
      }
    )
  }

  return (
    <Layout>
      <Card className='h-fit'>
        <CardHeader>
          New Demand
        </CardHeader>
        <CardContent className='overflow-hidden'>
          <Textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="I'm looking for a home for family 2+2 in Warsaw between 150000 and 200000 USD..."
            rows={6}
            className='resize-none'
            disabled={isPending}
          />
          <p className='text-xs text-muted-foreground'>
            {content.trim().length}/1000 characters (minimum 50)
          </p>
          <div className='flex gap-2 pt-2'>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isPending}
            />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+48 123 456 789 (optional)"
              disabled={isPending}
            />
          </div>
          <div className='pt-2'>
            <Input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Duration in days"
              min="1"
              max="180"
              disabled={isPending}
            />
            <p className='text-xs text-muted-foreground pt-1'>
              {isValidDays ? `Active for ${daysNum} days (max 180)` : 'Enter between 1 and 180 days'}
            </p>
          </div>
          <p className='text-xs text-muted-foreground pt-2'>
            Your email and phone will only be visible to users who apply to your demand
          </p>
          {error && (
            <p className="text-primary/70">
              {error instanceof Error ? error.message : 'Failed to create demand'}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className='w-full'
            onClick={handleSubmit}
            disabled={isPending || !trimmedContent || !trimmedEmail || !isValidContent || !isValidDays}
          >
            {isPending ? 'Posting...' : 'Post'}
          </Button>
        </CardFooter>
      </Card>
    </Layout>
  )
}