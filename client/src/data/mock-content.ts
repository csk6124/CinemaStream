export const moviePosters = [
  { id: 1, title: "The Adventure", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0" },
  { id: 2, title: "Urban Stories", image: "https://images.unsplash.com/photo-1572188863110-46d457c9234d" },
  { id: 3, title: "Night Tales", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1" },
  { id: 4, title: "The Journey", image: "https://images.unsplash.com/photo-1572988276585-71035689a285" },
  { id: 5, title: "Lost City", image: "https://images.unsplash.com/photo-1623116135518-7953c5038f5b" }
];

export const tvShows = [
  { id: 1, title: "Mystery Hour", image: "https://images.unsplash.com/photo-1467991521834-fb8e202c7074" },
  { id: 2, title: "Tech Life", image: "https://images.unsplash.com/photo-1593784991095-a205069470b6" },
  { id: 3, title: "Dark Dreams", image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575" },
  { id: 4, title: "Future World", image: "https://images.unsplash.com/photo-1528928441742-b4ccac1bb04c" }
];

export const categories = [
  { id: "trending", title: "Trending Now", content: moviePosters },
  { id: "shows", title: "Popular TV Shows", content: tvShows },
  { id: "new", title: "New Releases", content: moviePosters.slice(2) }
];
