'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EntityTableBrowser } from './entity-table-browser'
import { EntityCardView } from './entity-card-view'
import { EntityListView } from './entity-list-view'
import { useEntitySpecification } from '@/hooks/use-entity-specification'
import { EntitySpecification, EntityViewType } from '@/types/entity'

interface EntityBrowserProps {
  entityType: string
}

export function EntityBrowser({ entityType }: EntityBrowserProps) {
  const [activeView, setActiveView] = useState<EntityViewType>('table')
  const [entitySpec, setEntitySpec] = useState<EntitySpecification | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  const { getEntitySpecification } = useEntitySpecification()

  useEffect(() => {
    const loadEntitySpecification = async () => {
      try {
        setLoading(true)
        const spec = await getEntitySpecification(entityType)
        setEntitySpec(spec)
      } catch (error) {
        console.error('Failed to load entity specification:', error)
      } finally {
        setLoading(false)
      }
    }

    if (entityType) {
      loadEntitySpecification()
    }
  }, [entityType, getEntitySpecification])

  useEffect(() => {
    const view = searchParams.get('view') as EntityViewType
    if (view && ['table', 'card', 'list'].includes(view)) {
      setActiveView(view)
    }
  }, [searchParams])

  const handleViewChange = (view: EntityViewType) => {
    setActiveView(view)
    const params = new URLSearchParams(searchParams)
    params.set('view', view)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!entitySpec) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Entity not found</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{entitySpec.displayName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view your {entitySpec.displayName.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <Tabs value={activeView} onValueChange={handleViewChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="card">Card View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="table" active={activeView === 'table'}>
            <EntityTableBrowser entitySpec={entitySpec} />
          </TabsContent>

          <TabsContent value="card" active={activeView === 'card'}>
            <EntityCardView entitySpec={entitySpec} />
          </TabsContent>

          <TabsContent value="list" active={activeView === 'list'}>
            <EntityListView entitySpec={entitySpec} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
