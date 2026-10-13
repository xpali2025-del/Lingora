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
  return getDynamicSlugs('ar', ['subscription']);
}

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = `/${slug}/`;
  if (!getAllContent('ar').some((record) => record.route === route)) return {};
  return buildPageMetadata('ar', route);
}

export default async function ArabicContentRoute({ params }: PageProps) {
  const { slug } = await params;
  const route = `/${slug}/`;
  try {
    return <ContentPage content={getContentByRoute('ar', route)} />;
  } catch {
    notFound();
  }
}
