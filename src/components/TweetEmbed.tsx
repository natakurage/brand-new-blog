"use client";

import { useEffect } from 'react';

export default function TweetEmbed({ url }: { url: string }) {
  useEffect(() => {
    if (document.getElementById('twitter-wjs')) return;
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.id = 'twitter-wjs';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="">
      <blockquote className="twitter-tweet">
        <a href={url}>{url}</a>
      </blockquote>
    </div>
  );
}