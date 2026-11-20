import { describe, it, expect } from 'vitest'
import { greetingForHourIST } from '@/lib/prosperr/useGreeting'

describe('IST greeting', () => {
  it('covers every hour of the day', () => {
    const at = (h: number) => greetingForHourIST(h)
    expect([0, 1, 4].map(at)).toEqual(['Working late', 'Working late', 'Working late'])
    expect([5, 9, 11].map(at)).toEqual(['Good morning', 'Good morning', 'Good morning'])
    expect([12, 16].map(at)).toEqual(['Good afternoon', 'Good afternoon'])
    expect([17, 21].map(at)).toEqual(['Good evening', 'Good evening'])
    expect([22, 23].map(at)).toEqual(['Working late', 'Working late'])
  })
})
