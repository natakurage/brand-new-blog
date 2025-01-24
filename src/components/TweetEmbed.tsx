"use client";

import { useEffect, useState } from 'react';

export default function TweetEmbed({ url }: { url: string }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (document.getElementById('twitter-wjs')) return;
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    script.id = 'twitter-wjs';
    document.body.appendChild(script);

    setIsDarkMode(document.documentElement.dataset.theme === 'dark');
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <blockquote className="twitter-tweet" data-theme={isDarkMode ? "dark" : "light"}>
      <a href={url}>{url}</a>
    </blockquote>
  );
}