"use client";

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/app/hooks/useMounted';

export default function TweetEmbed({ url }: { url: string }) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();

  useEffect(() => {
    if (document.getElementById('twitter-wjs')) return;
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.id = 'twitter-wjs';
    document.body.appendChild(script);
    
    return () => {
      const scriptElement = document.getElementById('twitter-wjs');
      if (scriptElement) {
        document.body.removeChild(scriptElement);
      }
    };
  }, []);

  return (
    <blockquote className="twitter-tweet" data-theme={mounted && resolvedTheme === 'dark' ? "dark" : "light"}>
      <a href={url}>{url}</a>
    </blockquote>
  );
}