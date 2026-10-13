import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ContentPage } from '@/components/ContentPage';
import {
  getAllContent,
  getContentByRoute,
  getDynamicSlugs,
} from '@/lib/content';
import { buildPageMetadata } from '@/lib/metadata';

export const dynamicParams = false;

export function generateStaticParams() {
  return getDynamicSlugs('en', ['plans']);
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = `/en/${slug}/`;
  if (!getAllContent('en').some((record) => record.route === route)) return {};
  return buildPageMetadata('en', route);
}

export default async function EnglishContentRoute({ params }: PageProps) {
  const { slug } = await params;
  const route = `/en/${slug}/`;
  try {
    return <ContentPage content={getContentByRoute('en', route)} />;
  } catch {
    notFound();
  }
}
