using System;

namespace pokemon_oppgave
{
    class Program
    {
        static void Main()
        {
            Pikachu pikachu = new Pikachu();
            pikachu.Navn = "Pikachu";
            pikachu.Type = "Elektrisk";
            pikachu.Level = 5;
            pikachu.Hp = 35;
            pikachu.Angrep = "Tordenstøt";

            Console.WriteLine($"Navn: {pikachu.Navn}");
            Console.WriteLine($"Type: {pikachu.Type}");
            Console.WriteLine($"Level: {pikachu.Level}");
            Console.WriteLine($"HP: {pikachu.Hp}");
            Console.WriteLine($"Angrep: {pikachu.Angrep}");
        }
    }
}
