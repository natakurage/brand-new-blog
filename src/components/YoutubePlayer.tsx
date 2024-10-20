export function YouTubePlayer({ vid }: { vid: string }) {
  return (
    <iframe 
      src={`https://www.youtube.com/embed/${vid}`}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full aspect-video"
    />
  );
}
