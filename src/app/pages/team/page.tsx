/**
 * 👥 Team Page
 *
 * Meet the team members
 */

'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Github, Linkedin, Twitter, Mail } from 'lucide-react'

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Passionate about building products that make a difference.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    bio: 'Tech enthusiast with 15+ years of experience in software development.',
    social: {
      twitter: '#',
      linkedin: '#',
      github: '#',
    },
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Design',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    bio: 'Creating beautiful and intuitive user experiences.',
    social: {
      twitter: '#',
      linkedin: '#',
    },
  },
  {
    name: 'David Kim',
    role: 'Lead Developer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    bio: 'Full-stack developer who loves clean code and great architecture.',
    social: {
      twitter: '#',
      github: '#',
    },
  },
  {
    name: 'Lisa Wang',
    role: 'Product Manager',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    bio: 'Bridging the gap between business needs and technical solutions.',
    social: {
      linkedin: '#',
      twitter: '#',
    },
  },
  {
    name: 'James Wilson',
    role: 'Marketing Director',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    bio: 'Storyteller and growth hacker. Building brand awareness.',
    social: {
      twitter: '#',
      linkedin: '#',
    },
  },
  {
    name: 'Anna Martinez',
    role: 'Customer Success',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    bio: 'Dedicated to ensuring our customers achieve their goals.',
    social: {
      linkedin: '#',
      twitter: '#',
    },
  },
  {
    name: 'Tom Anderson',
    role: 'DevOps Engineer',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    bio: 'Keeping systems running smoothly and securely 24/7.',
    social: {
      github: '#',
      linkedin: '#',
    },
  },
]

const departments = [
  { name: 'Engineering', count: 12, color: 'bg-blue-500' },
  { name: 'Design', count: 5, color: 'bg-purple-500' },
  { name: 'Product', count: 4, color: 'bg-green-500' },
  { name: 'Marketing', count: 6, color: 'bg-orange-500' },
  { name: 'Sales', count: 8, color: 'bg-pink-500' },
  { name: 'Support', count: 7, color: 'bg-cyan-500' },
]

export default function TeamPage() {
  return (
    <div className="container py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <Badge className="mb-4">Our Team</Badge>
        <h1 className="mb-4 text-4xl font-bold">Meet the people behind the magic</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          We're a diverse team of passionate individuals working together to build something amazing.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-16 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {departments.map((dept, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${dept.color}`} />
                <div>
                  <p className="text-sm text-muted-foreground">{dept.name}</p>
                  <p className="text-2xl font-bold">{dept.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Team Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {teamMembers.map((member, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-square w-full overflow-hidden bg-muted">
              <img
                src={member.image}
                alt={member.name}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <CardContent className="p-6">
              <h3 className="mb-1 text-lg font-semibold">{member.name}</h3>
              <p className="mb-3 text-sm text-muted-foreground">{member.role}</p>
              <p className="mb-4 text-sm">{member.bio}</p>
              <div className="flex gap-2">
                {member.social.twitter && (
                  <Button variant="outline" size="icon">
                    <Twitter className="h-4 w-4" />
                  </Button>
                )}
                {member.social.linkedin && (
                  <Button variant="outline" size="icon">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                )}
                {member.social.github && (
                  <Button variant="outline" size="icon">
                    <Github className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Join Team CTA */}
      <Card className="mt-16">
        <CardContent className="p-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Join Our Team</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            We're always looking for talented individuals who share our passion for innovation.
            Check out our open positions and become part of our journey.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg">
              View Open Positions
            </Button>
            <Button size="lg" variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Contact HR
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Company Values */}
      <div className="mt-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Our Values</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Innovation</h3>
              <p className="text-muted-foreground">
                We constantly push boundaries and embrace new ideas to create better solutions.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Collaboration</h3>
              <p className="text-muted-foreground">
                We believe in the power of teamwork and working together towards common goals.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-2 text-xl font-semibold">Excellence</h3>
              <p className="text-muted-foreground">
                We strive for excellence in everything we do and never settle for mediocrity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
