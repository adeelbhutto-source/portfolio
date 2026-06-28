using System;

class Program
{
    static void Main(string[] args)
    {
        string tekst = "Kodesnakk";

        foreach (char bokstav in tekst)
        {
            Console.WriteLine(bokstav);
        }

        Console.ReadLine();
    }
}
