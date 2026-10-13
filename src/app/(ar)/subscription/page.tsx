import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage';
import { getContentByRoute } from '@/lib/content';
import { buildPageMetadata } from '@/lib/metadata';

export function generateMetadata(): Metadata {
  return buildPageMetadata('ar', '/subscription/');
}

export default function ArabicPlansPage() {
  return <ContentPage content={getContentByRoute('ar', '/subscription/')} />;
}
