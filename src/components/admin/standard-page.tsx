'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PageHeader } from './page-header'

interface StandardPageProps {
  locale: string
  title: string
  description?: string
  breadcrumbs: { label: string; href?: string }[]
  primaryAction?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: React.ElementType
  }
  children: React.ReactNode
}

export function StandardPage({
  locale,
  title,
  description,
  breadcrumbs,
  primaryAction,
  children
}: StandardPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <PageHeader
        locale={locale}
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        primaryAction={primaryAction}
      />
      <div className="relative">
        <AnimatePresence mode="popLayout">
          {children}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
