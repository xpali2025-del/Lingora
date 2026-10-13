import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage';
import { getContentByRoute } from '@/lib/content';
import { buildPageMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return buildPageMetadata('en', '/en/plans/');
}

export default function EnglishPlansPage() {
  return <ContentPage content={getContentByRoute('en', '/en/plans/')} />;
}
