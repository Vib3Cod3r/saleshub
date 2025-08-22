'use client'

import { EntitySpecification } from '@/types/entity'

interface EntityListViewProps {
  entitySpec: EntitySpecification
}

export function EntityListView({ entitySpec }: EntityListViewProps) {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          List View
        </h3>
        <p className="text-gray-500">
          List view for {entitySpec.displayName} is coming soon...
        </p>
      </div>
    </div>
  )
}
