class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Skriv inn en tekst:");
        string input = Console.ReadLine();

        Console.WriteLine("\nDu skrev: " + input);
        Console.WriteLine("1 - Reverser");
        Console.WriteLine("2 - Store bokstaver");
        Console.WriteLine("3 - Små bokstaver");

        string valg = Console.ReadLine();

        if (valg == "1")
        {
            string resultat = "";
            foreach (char bokstav in input)
            {
                resultat = bokstav + resultat;
            }
            Console.WriteLine(resultat);
        }
        else if (valg == "2")
        {
            Console.WriteLine(input.ToUpper());
        }
        else if (valg == "3")
        {
            Console.WriteLine(input.ToLower());
        }
        else
        {
            Console.WriteLine("Ugyldig valg");
        }
    }
}
