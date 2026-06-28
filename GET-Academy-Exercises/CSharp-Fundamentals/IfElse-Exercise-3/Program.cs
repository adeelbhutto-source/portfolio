using System;

class Program
{
    static bool SjekkTretti(int tall1, int tall2)
    {
        if (tall1 == 30 || tall2 == 30 || (tall1 + tall2) == 30)
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    static void Main(string[] args)
    {
        Console.WriteLine(SjekkTretti(30, 5));
        Console.WriteLine(SjekkTretti(15, 15));
        Console.WriteLine(SjekkTretti(10, 5));

        Console.ReadLine();
    }
}
