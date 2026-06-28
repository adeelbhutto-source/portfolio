using System;

class Program
{
    static void Main(string[] args)
    {
        int runde = 1;

        while (runde < 10)
        {
            Console.WriteLine("Runde nr " + runde);
            runde++;
        }

        Console.ReadLine();
    }
}
