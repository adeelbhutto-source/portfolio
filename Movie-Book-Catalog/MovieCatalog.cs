using System;
using System.Collections.Generic;
using System.Text;

namespace MovieBookCatalog
{
    internal class MovieCatalog
    {
        List<Movie> movies= new List<Movie>();

        public void AddMovies(Movie movie)
        {
            movies.Add(movie);
        }

        public void ShowMovies()
        {
            foreach (Movie movie in movies)
            {
                Console.WriteLine("-----Film-----");

                Console.WriteLine($"Tittel: {movie.Title} " +
                                  $"\nBeskrivelse: {movie.Desc} " +
                                  $"\nRegissør: {movie.Regissør} " +
                                  $"\nUtgivelsesår: {movie.Year}" +
                                  $"\n" );
            }
        }
    }
}
