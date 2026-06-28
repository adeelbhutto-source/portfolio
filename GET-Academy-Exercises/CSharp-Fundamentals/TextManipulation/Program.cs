using System;

class Program
{
    static string RotateText(string tekst)
    {
        char[] bokstaver = tekst.ToCharArray();
        Array.Reverse(bokstaver);
        return new string(bokstaver);
    }

    static string ChangeWord(string tekst)
    {
        return tekst.Replace('e', 'a').Replace('E', 'A');
    }

    static void Main(string[] args)
    {
        Console.WriteLine("1. RotateText");
        Console.WriteLine("2. Change word");
        string valg = Console.ReadLine();

        Console.WriteLine("Skriv inn et ord:");
        string ord = Console.ReadLine();

        if (valg == "1")
        {
            Console.WriteLine(RotateText(ord));
        }
        else if (valg == "2")
        {
            Console.WriteLine(ChangeWord(ord));
        }

        Console.ReadLine();
    }
}
