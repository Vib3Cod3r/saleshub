'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Mail, User, Lock, Plus, Settings, Trash2, Eye, EyeOff } from 'lucide-react'

export default function ComponentsShowcasePage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SalesHub CRM - Component Showcase</h1>
          <p className="text-gray-600">Demonstrating our design system and UI components</p>
        </div>

        {/* Button Components */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Button Components</h2>
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Different button styles and states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button>Default Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
                <Button size="icon"><Plus /></Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button leftIcon={<Mail />}>With Left Icon</Button>
                <Button rightIcon={<Settings />}>With Right Icon</Button>
                <Button loading>Loading Button</Button>
                <Button disabled>Disabled</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Input Components */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Input Components</h2>
          <Card>
            <CardHeader>
              <CardTitle>Input Variants</CardTitle>
              <CardDescription>Different input styles and states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Default Input" placeholder="Enter text..." />
                <Input label="With Left Icon" leftIcon={<User />} placeholder="Enter username..." />
                <Input label="With Right Icon" rightIcon={<Mail />} placeholder="Enter email..." />
                <Input label="Password Input" type="password" showPasswordToggle placeholder="Enter password..." />
                <Input label="Success State" success="Input is valid" placeholder="Valid input..." />
                <Input label="Error State" error="This field is required" placeholder="Invalid input..." />
                <Input label="Warning State" warning="Please check your input" placeholder="Warning input..." />
                <Input label="Disabled Input" disabled placeholder="Disabled input..." />
                <Input label="Helper Text" helperText="This is helpful information" placeholder="With helper text..." />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input size="sm" label="Small Input" placeholder="Small..." />
                <Input size="default" label="Default Input" placeholder="Default..." />
                <Input size="lg" label="Large Input" placeholder="Large..." />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Card Components */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Card Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>This is a default card with header and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">This is the card content area where you can put any content.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>This card has more shadow for emphasis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Elevated cards are great for important content.</p>
              </CardContent>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>This card is clickable and has hover effects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Interactive cards respond to user interaction.</p>
              </CardContent>
            </Card>

            <Card variant="outline">
              <CardHeader>
                <CardTitle>Outline Card</CardTitle>
                <CardDescription>This card has a border but no background</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Outline cards are subtle and clean.</p>
              </CardContent>
            </Card>

            <Card variant="ghost">
              <CardHeader>
                <CardTitle>Ghost Card</CardTitle>
                <CardDescription>This card has no border or shadow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Ghost cards are minimal and unobtrusive.</p>
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader>
                <CardTitle>Large Padding</CardTitle>
                <CardDescription>This card has extra padding</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Cards can have different padding sizes.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Modal Component */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Modal Component</h2>
          <Card>
            <CardHeader>
              <CardTitle>Modal Demo</CardTitle>
              <CardDescription>Click the button to open a modal dialog</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setModalOpen(true)} leftIcon={<Plus />}>
                Open Modal
              </Button>
            </CardContent>
          </Card>

          <Modal open={modalOpen} onOpenChange={setModalOpen}>
            <Modal.Content size="md">
              <Modal.Header>Create New Contact</Modal.Header>
              <Modal.Body>
                <div className="space-y-4">
                  <Input label="First Name" placeholder="Enter first name..." />
                  <Input label="Last Name" placeholder="Enter last name..." />
                  <Input label="Email" type="email" placeholder="Enter email..." />
                  <Input label="Phone" placeholder="Enter phone number..." />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>
                  Create Contact
                </Button>
              </Modal.Footer>
            </Modal.Content>
          </Modal>
        </section>

        {/* Design System Colors */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Design System Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Primary Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Primary 50</span>
                    <div className="w-8 h-8 bg-primary-50 rounded border"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Primary 500</span>
                    <div className="w-8 h-8 bg-primary-500 rounded border"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Primary 900</span>
                    <div className="w-8 h-8 bg-primary-900 rounded border"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Colors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Success</span>
                    <div className="w-8 h-8 bg-success-500 rounded border"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Warning</span>
                    <div className="w-8 h-8 bg-warning-500 rounded border"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Error</span>
                    <div className="w-8 h-8 bg-error-500 rounded border"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gray Scale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gray 50</span>
                    <div className="w-8 h-8 bg-gray-50 rounded border"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gray 500</span>
                    <div className="w-8 h-8 bg-gray-500 rounded border"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gray 900</span>
                    <div className="w-8 h-8 bg-gray-900 rounded border"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
