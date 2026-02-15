import { describe, expect, it } from 'vitest'

import { Button } from '@/components/ui/button'
import queries from '@/graphql/queries'
import { cn } from '@/lib/utils'
import type { Animal } from '@/types'

describe('Vite path aliases', () => {
  it('resolve components, graphql, lib, and types paths', () => {
    const sampleAnimal: Animal = {
      _id: 'animal-1',
      name: 'Nova',
      type: 'dog',
      age: 3,
      sex: 'Female',
      color: 'Black',
      description: 'Friendly and energetic',
      image: 'https://example.com/nova.jpg',
      video: 'https://example.com/nova.mp4',
      status: 'available',
    }

    expect(typeof cn).toBe('function')
    expect(Button).toBeDefined()
    expect(queries.FETCH_ANIMAL).toBeDefined()
    expect(sampleAnimal.status).toBe('available')
  })
})
