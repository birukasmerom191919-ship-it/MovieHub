import React from 'react';
import { Tv, ShoppingBag, Film, ExternalLink } from 'lucide-react';
import { WatchProvidersResult } from '../../types';
import { getPosterUrl } from '../../services/tmdb';

interface WhereToWatchProps {
  providers: WatchProvidersResult | null;
}

export const WhereToWatch: React.FC<WhereToWatchProps> = ({ providers }) => {
  if (!providers) return null;

  const flatrate = providers.flatrate || [];
  const rent = providers.rent || [];
  const buy = providers.buy || [];
  const free = providers.free || providers.ads || [];

  const hasProviders = flatrate.length > 0 || rent.length > 0 || buy.length > 0 || free.length > 0;

  if (!hasProviders) {
    return (
      <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl text-xs text-neutral-400">
        Streaming provider information is currently unlisted for this title. Check your local theater or digital store listings.
      </div>
    );
  }

  return (
    <div className="p-5 bg-neutral-900/80 border border-neutral-800 rounded-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-bold text-white">Where to Watch</h3>
        </div>
        {providers.link && (
          <a
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
          >
            Powered by JustWatch <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Subscription / Stream */}
      {flatrate.length > 0 && (
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Stream (Subscription)
          </span>
          <div className="flex flex-wrap gap-3">
            {flatrate.map((p, index) => (
              <div
                key={`flat-${p.provider_id}-${index}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl"
              >
                <img
                  src={getPosterUrl(p.logo_path, 'w185')}
                  alt={p.provider_name}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-md object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=100&auto=format&fit=crop';
                  }}
                />
                <span className="text-xs font-medium text-neutral-200">{p.provider_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rent / Buy */}
      {(rent.length > 0 || buy.length > 0) && (
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Rent or Buy
          </span>
          <div className="flex flex-wrap gap-3">
            {[...rent, ...buy]
              .reduce((acc, curr) => {
                if (!acc.some((item) => item.provider_id === curr.provider_id)) acc.push(curr);
                return acc;
              }, [] as typeof rent)
              .map((p, index) => (
                <div
                  key={`rentbuy-${p.provider_id}-${index}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl"
                >
                  <img
                    src={getPosterUrl(p.logo_path, 'w185')}
                    alt={p.provider_name}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-md object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=100&auto=format&fit=crop';
                    }}
                  />
                  <span className="text-xs font-medium text-neutral-200">{p.provider_name}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-neutral-500 pt-1 border-t border-neutral-800/60">
        MovieHub is a discovery platform and does not stream copyrighted video files directly.
      </p>
    </div>
  );
};
