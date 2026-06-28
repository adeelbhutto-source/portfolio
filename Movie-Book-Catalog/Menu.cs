using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Channels;

namespace MovieBookCatalog
{
    internal class Menu
    {
        MovieCatalog catalog = new MovieCatalog();

        private void AddMovie()
        {

                Movie movie = new Movie();

                Console.WriteLine("-------Legg til film-------");

                Console.Write("Legg til tittel: ");
                movie.Title = Convert.ToString(Console.ReadLine());

                Console.Write("Legg til beskrivelse: ");
                movie.Desc = Convert.ToString(Console.ReadLine());

                Console.Write("Legg til Regissør: ");
                movie.Regissør = Convert.ToString(Console.ReadLine());

                try
                {
                    Console.Write("Legg til utgivelsesår: ");
                    movie.Year = Convert.ToInt32(Console.ReadLine());
                }
                catch (FormatException e)
                {
                    Console.WriteLine("---------------------------\n" +
                                             "\tKUN NUMMER!");
                    Console.Write("Legg til utgivelsesår: ");
                    movie.Year = Convert.ToInt32(Console.ReadLine());
                }

                catalog.AddMovies(movie);

                Console.WriteLine();
        }

        private void ShowMovie()
        {
            catalog.ShowMovies();
        }

        public void Run()
        {

            bool isTrue = true;

            while (isTrue)
            {
                Console.WriteLine("-------Hovedmeny-------");

                Console.WriteLine("1. Legg til film");
                Console.WriteLine("2. Vis alle filmer");
                Console.WriteLine("3. Avslutt");

                string input = Console.ReadLine();

                switch (input)
                {
                    case "1":
                        AddMovie();
                        break;

                    case "2":
                        ShowMovie();
                        break;

                    default:
                        isTrue = false;
                        Console.WriteLine("");
                        break;

                }
            }
        }
    }
}
