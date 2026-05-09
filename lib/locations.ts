export interface StorageLocation {
  name: string;
  address: string;
  reviewUrl: string;
}

export const LOCATIONS: Record<string, StorageLocation> = {
  "midtown-manhattan": {
    name: "CubeSmart Midtown Manhattan",
    address: "444 W 55th St, New York, NY 10019",
    reviewUrl:
      "https://search.google.com/local/writereview?placeid=ChIJN8j2jFlYwokRjEmjsEjgJyg",
  },
  "clinton-hill-brooklyn": {
    name: "CubeSmart Clinton Hill",
    address: "45 Clinton Ave, Brooklyn, NY 11205",
    reviewUrl:
      "https://search.google.com/local/writereview?placeid=ChIJbdyDjMJbwokRSeauP_EeR20",
  },
  "gowanus-brooklyn": {
    name: "CubeSmart Gowanus",
    address: "338 3rd Ave, Brooklyn, NY 11215",
    reviewUrl:
      "https://search.google.com/local/writereview?placeid=ChIJXYQNXf9awokRNqeGJdP6Jew",
  },
  "astoria-queens": {
    name: "CubeSmart Astoria",
    address: "22-25 46th St, Astoria, NY 11105",
    reviewUrl:
      "https://search.google.com/local/writereview?placeid=ChIJl7XUWlJfwokRtlv-npFkVxs",
  },
  "co-op-city-bronx": {
    name: "CubeSmart Co-op City",
    address: "2325 Hollers Ave, Bronx, NY 10475",
    reviewUrl:
      "https://search.google.com/local/writereview?placeid=ChIJ6xBBKDuNwokRNsoD75Io9kc",
  },
};

export const LOCATION_OPTIONS = Object.entries(LOCATIONS).map(
  ([slug, loc]) => ({ slug, name: loc.name }),
);
