using System;

class Program
{
    static bool SjekkOmLike(int tall1, int tall2)
    {
        if (tall1 == tall2)
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
        Console.WriteLine(SjekkOmLike(5, 5));
        Console.WriteLine(SjekkOmLike(4, 9));

        Console.ReadLine();
    }
}
