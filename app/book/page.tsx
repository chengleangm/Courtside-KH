import BookPageClient from './BookPageClient';

type BookPageProps = {
  searchParams: Promise<{
    court?: string | string[];
  }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;

  const requestedCourtId =
    typeof params.court === 'string'
      ? params.court
      : Array.isArray(params.court)
        ? params.court[0]
        : undefined;

  return <BookPageClient requestedCourtId={requestedCourtId} />;
}
