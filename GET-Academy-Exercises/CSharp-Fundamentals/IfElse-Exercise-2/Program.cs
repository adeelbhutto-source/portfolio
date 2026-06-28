using System;

class Program
{
    static int RegnUtTall(int tall1, int tall2)
    {
        if (tall1 == tall2)
        {
            return tall1 * tall2;
        }
        else
        {
            return tall1 + tall2;
        }
    }

    static void Main(string[] args)
    {
        Console.WriteLine(RegnUtTall(4, 6));
        Console.WriteLine(RegnUtTall(5, 5));

        Console.ReadLine();
    }
}
