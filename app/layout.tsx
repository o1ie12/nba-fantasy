import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NBA Draft Companion',
  description: 'Oct 11 ESPN fantasy basketball live draft companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
