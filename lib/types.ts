export type Photo = {
  id: string;
  url: string;
  alt: string;
};

export type HomeSlide = {
  id: string;
  slug: string;
  title: string;
  description: string;
  leftPhoto: Photo;
  rightPhoto: Photo;
};

export type ProjectLink = {
  slug: string;
  title: string;
};

export type PortfolioItem = ProjectLink & {
  description: string;
  // The first few photos: the first is the desktop hover preview, all of them form the phone strip.
  photos: Photo[];
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  details: string;
  photos: Photo[];
};
