import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage';
import { getContentByRoute } from '@/lib/content';
import { buildPageMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return buildPageMetadata('ar', '/');
}

export default function ArabicHomePage() {
  return <ContentPage content={getContentByRoute('ar', '/')} />;
}
