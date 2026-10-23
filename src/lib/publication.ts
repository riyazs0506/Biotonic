import { industries } from '../content/industries';
import { founder } from '../content/leadership';
import { isConfirmed } from '../content/pending';
import { quality } from '../content/quality';
import { resources } from '../content/resources';
import { IS_RELEASE } from './env';

/**
 * Decides which optional pages are published. In draft builds every page is visible (with
 * demo content where facts are pending) so the client can review it; in release builds a page whose essential content is still
 * unconfirmed is removed from navigation, the sitemap and prerendering (and so returns 404).
 */
export type OptionalPage = 'leadership' | 'quality' | 'industries' | 'resources';

export function hasConfirmedContent(page: OptionalPage): boolean {
  switch (page) {
    case 'leadership':
      return (
        isConfirmed(founder.name) && isConfirmed(founder.title) && isConfirmed(founder.biography)
      );
    case 'quality':
      return isConfirmed(quality.overview);
    case 'industries':
      return isConfirmed(industries) && industries.length > 0;
    case 'resources':
      return isConfirmed(resources) && resources.length > 0;
  }
}

export function isPublished(page: OptionalPage, release = IS_RELEASE): boolean {
  return !release || hasConfirmedContent(page);
}
