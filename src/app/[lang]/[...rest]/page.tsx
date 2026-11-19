import { notFound } from 'next/navigation'

// Any URL that matches no page ends up here, so the 404 renders inside the [lang] layout
// (with the right <html lang>, header and footer) instead of a language-less root.
export default function CatchAll() {
  notFound()
}
