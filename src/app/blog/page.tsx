import { redirect } from 'next/navigation';

export default function BlogIndexPage() {
  // Home page (/) already serves as the main blog feed.
  // Redirect /blog to / to prevent 404s.
  redirect('/');
}
