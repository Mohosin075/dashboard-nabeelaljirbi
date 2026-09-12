/**
 * 💰 Pricing Page
 *
 * Beautiful pricing plans with features comparison
 */

'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: { monthly: 0, yearly: 0 },
    features: [
      { name: 'Up to 3 projects', included: true },
      { name: '1 GB storage', included: true },
      { name: 'Basic support', included: true },
      { name: 'Advanced analytics', included: false },
      { name: 'Custom domain', included: false },
      { name: 'Priority support', included: false },
      { name: 'Team collaboration', included: false },
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'For professionals and small teams',
    price: { monthly: 29, yearly: 290 },
    features: [
      { name: 'Unlimited projects', included: true },
      { name: '50 GB storage', included: true },
      { name: 'Priority support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom domain', included: true },
      { name: 'Team collaboration (5 users)', included: true },
      { name: 'API access', included: false },
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: { monthly: 99, yearly: 990 },
    features: [
      { name: 'Unlimited projects', included: true },
      { name: 'Unlimited storage', included: true },
      { name: '24/7 dedicated support', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom domain', included: true },
      { name: 'Unlimited team members', included: true },
      { name: 'API access', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-16 text-center">
        <Badge className="mb-4">Pricing</Badge>
        <h1 className="mb-4 text-4xl font-bold">Choose the perfect plan for you</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Start for free, upgrade when you grow. No hidden fees, no credit card required.
        </p>

        {/* Billing Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <Label htmlFor="billing-toggle" className={!isYearly ? 'font-semibold' : ''}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
          />
          <Label htmlFor="billing-toggle" className={isYearly ? 'font-semibold' : ''}>
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 17%
            </Badge>
          </Label>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={plan.popular ? 'border-primary shadow-lg' : ''}
          >
            {plan.popular && (
              <div className="rounded-t-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">
                  ${isYearly ? plan.price.yearly : plan.price.monthly}
                </span>
                <span className="text-muted-foreground">
                  /{isYearly ? 'year' : 'month'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                {plan.cta}
              </Button>

              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span
                      className={
                        feature.included ? '' : 'text-muted-foreground'
                      }
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="mt-24">
        <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>
        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change my plan later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected
                in your next billing cycle.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
