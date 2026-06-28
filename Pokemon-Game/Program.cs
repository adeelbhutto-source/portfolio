namespace Pokemon
{
    internal class Program
    {
        static void Main(string[] args)
        {
            Console.Write("Hva heter du, trener? ");
            string name = Console.ReadLine()?.Trim() ?? "Ash";

            Console.WriteLine("\nVelg startpokemon:");
            Console.WriteLine("1) Charmander  [flamme]");
            Console.WriteLine("2) Bulbasaur   [gress]");
            Console.WriteLine("3) Squirtle    [vann]");
            Console.Write("> ");

            ConsoleKeyInfo starterChoice = Console.ReadKey(true);
            Pokemon ? chosenPokemon = starterChoice.Key
                switch
            {
                 ConsoleKey.D1
                    => new Pokemon("Charmander", "flamme", 39, 14, 7,
                        new List<Move> { new("Ember", 12, 85), new("Scratch", 6, 95) }),

                 ConsoleKey.D2
                    => new Pokemon("Bulbasaur", "gress", 45, 12, 8,
                        new List<Move> { new("Vine Whip", 10, 85), new("Tackle", 6, 95) }),

                 ConsoleKey.D3
                    => new Pokemon("Squirtle", "vann", 44, 11, 10,
                        new List<Move> { new("Water Gun", 10, 85), new("Tackle", 6, 95) }),

                 _ => null
            };

            Console.WriteLine($"Du valgte {chosenPokemon.Name}!");
            new App(new Trainer(name, chosenPokemon)).Run();
        }
    }
}
