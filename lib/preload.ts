// Resolves once the given images are in the browser cache (or failed, or took too long),
// so a page can keep its loading screen up until the first photos can appear at once.
const PRELOAD_TIMEOUT_MS = 8000;

export function preloadImages(urls: string[]): Promise<void> {
  const loads = urls.map(
    (url) =>
      new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = image.onerror = () => resolve();
        image.src = url;
      }),
  );
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, PRELOAD_TIMEOUT_MS));
  return Promise.race([Promise.all(loads).then(() => undefined), timeout]);
}
