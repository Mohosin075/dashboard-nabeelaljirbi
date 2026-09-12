/**
 * ❓ FAQ Page
 *
 * Frequently asked questions with accordion
 */

'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, HelpCircle, Mail } from 'lucide-react'

const faqCategories = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I create an account?',
        answer:
          'Click the "Sign Up" button in the navigation bar, fill in your details, and verify your email address. You can also sign up using Google or GitHub for faster access.',
      },
      {
        question: 'Is there a free trial?',
        answer:
          'Yes! All paid plans come with a 14-day free trial. No credit card required to start. You can explore all features and upgrade when you\'re ready.',
      },
      {
        question: 'How do I get started after signing up?',
        answer:
          'After verification, you\'ll be guided through a quick onboarding process. We\'ll help you set up your first project and introduce you to key features.',
      },
    ],
  },
  {
    title: 'Pricing & Billing',
    items: [
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans.',
      },
      {
        question: 'Can I change my plan later?',
        answer:
          'Absolutely! You can upgrade or downgrade your plan at any time from your account settings. Changes will be reflected in your next billing cycle.',
      },
      {
        question: 'Do you offer refunds?',
        answer:
          'We offer a 30-day money-back guarantee. If you\'re not satisfied with our service within the first 30 days, contact support for a full refund.',
      },
      {
        question: 'What happens when I reach my plan limits?',
        answer:
          'You\'ll receive a notification when approaching your limits. You can choose to upgrade your plan or wait until the next billing cycle for limit reset.',
      },
    ],
  },
  {
    title: 'Features & Functionality',
    items: [
      {
        question: 'Can I integrate with other tools?',
        answer:
          'Yes! We offer integrations with popular tools like Slack, Zapier, GitHub, and more. API access is available on Pro and Enterprise plans.',
      },
      {
        question: 'Is my data secure?',
        answer:
          'Security is our top priority. We use bank-level encryption, regular security audits, and compliance with industry standards like GDPR and SOC 2.',
      },
      {
        question: 'Can I export my data?',
        answer:
          'Yes! You can export all your data at any time in CSV, JSON, or PDF formats. Your data always belongs to you.',
      },
      {
        question: 'Do you offer team collaboration features?',
        answer:
          'Yes! Pro and Enterprise plans include team collaboration with role-based permissions, shared workspaces, and real-time collaboration tools.',
      },
    ],
  },
  {
    title: 'Support & Help',
    items: [
      {
        question: 'How can I contact support?',
        answer:
          'You can reach our support team via email at support@example.com, through the in-app chat, or by submitting a ticket. Enterprise customers get 24/7 phone support.',
      },
      {
        question: 'What are your support hours?',
        answer:
          'Email and chat support are available Monday-Friday, 9 AM - 6 PM EST. Enterprise customers have access to 24/7 support with dedicated account managers.',
      },
      {
        question: 'Do you have documentation?',
        answer:
          'Yes! We have comprehensive documentation, video tutorials, and a knowledge base. Visit our Help Center for detailed guides and best practices.',
      },
    ],
  },
  {
    title: 'Technical Questions',
    items: [
      {
        question: 'What are the system requirements?',
        answer:
          'Our platform works on all modern browsers (Chrome, Firefox, Safari, Edge). We also offer mobile apps for iOS and Android. No special software installation required.',
      },
      {
        question: 'Do you have an API?',
        answer:
          'Yes! Our RESTful API is available on Pro and Enterprise plans. Full documentation and SDKs for popular programming languages are provided.',
      },
      {
        question: 'What about uptime and reliability?',
        answer:
          'We guarantee 99.9% uptime with redundant servers and automated backups. Real-time status updates are available on our status page.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <Badge className="mb-4">FAQ</Badge>
        <h1 className="mb-4 text-4xl font-bold">Frequently Asked Questions</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Find answers to common questions about our service, features, and policies.
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-12 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for questions..."
            className="pl-10"
          />
        </div>
      </div>

      {/* FAQ Categories */}
      <div className="mx-auto max-w-4xl space-y-12">
        {faqCategories.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h2 className="mb-6 text-2xl font-bold">{category.title}</h2>
            <Accordion type="single" collapsible className="w-full">
              {category.items.map((item, itemIndex) => (
                <AccordionItem key={itemIndex} value={`item-${categoryIndex}-${itemIndex}`}>
                  <AccordionTrigger className="text-left">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      {/* Still Have Questions */}
      <Card className="mx-auto mt-16 max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Still have questions?</CardTitle>
          <CardDescription>
            Can't find the answer you're looking for? Please chat to our friendly team.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-4">
          <Button>
            <Mail className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
          <Button variant="outline">Schedule a Call</Button>
        </CardContent>
      </Card>
    </div>
  )
}
