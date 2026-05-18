import { Search, Filter, X } from 'lucide-react';

export default function BookFilter({
  search,
  setSearch,
  genre,
  setGenre,
  availability,
  setAvailability,
  sortBy,
  setSortBy,
  genres = []
}) {
  return (
    <div className="card p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or category..."
            className="input pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Genre Filter */}
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="input w-full lg:w-48"
        >
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        {/* Availability */}
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="input w-full lg:w-40"
        >
          <option value="">All Books</option>
          <option value="available">Available</option>
          <option value="unavailable">Checked Out</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input w-full lg:w-40"
        >
          <option value="createdAt">Newest First</option>
          <option value="title">Title A-Z</option>
          <option value="author">Author A-Z</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>
  );
}
