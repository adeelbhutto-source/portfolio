using System;

class Program
{
    static void Main(string[] args)
    {
        int poeng = 0;
        Random maskin = new Random();

        while (true)
        {
            int tall1 = maskin.Next(1, 12);
            int tall2 = maskin.Next(1, 12);

            Console.WriteLine(tall1 + " _ " + tall2);
            string input = Console.ReadLine();

            if (input != "<" && input != ">" && input != "=")
            {
                break;
            }

            string riktigSvar;
            if (tall1 < tall2)
            {
                riktigSvar = "<";
            }
            else if (tall1 > tall2)
            {
                riktigSvar = ">";
            }
            else
            {
                riktigSvar = "=";
            }

            if (input == riktigSvar)
            {
                poeng++;
                Console.WriteLine("Riktig! Poeng: " + poeng);
            }
            else
            {
                poeng--;
                Console.WriteLine("Feil! Poeng: " + poeng);
            }
        }
    }
}
