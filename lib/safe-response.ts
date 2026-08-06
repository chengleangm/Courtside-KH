export async function readJsonResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      response.ok
        ? fallbackMessage
        : `${fallbackMessage} (server returned ${response.status} with an empty response)`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    const contentType = response.headers.get('content-type') ?? '';
    const detail = contentType.includes('text/html')
      ? 'The server returned an HTML error page instead of JSON.'
      : 'The server returned an invalid response.';
    throw new Error(`${fallbackMessage} ${detail}`);
  }
}
