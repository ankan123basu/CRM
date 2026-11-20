'use client'

import { useEffect, useState } from 'react'

/** Greeting for the current hour in IST (the team works in India). */
export function greetingForHourIST(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 22) return 'Good evening'
  return 'Working late'
}

function currentHourIST(): number {
  return Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date())) % 24
}

/**
 * Live greeting: computed in the browser and refreshed every minute, so a page
 * left open past 5 pm or midnight updates by itself. Returns null until mounted
 * so server and client HTML never disagree.
 */
export function useGreeting(): string | null {
  const [greeting, setGreeting] = useState<string | null>(null)
  useEffect(() => {
    const update = () => setGreeting(greetingForHourIST(currentHourIST()))
    const first = setTimeout(update, 0)
    const id = setInterval(update, 60_000)
    return () => { clearTimeout(first); clearInterval(id) }
  }, [])
  return greeting
}
