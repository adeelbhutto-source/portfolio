namespace Pokemon
{
    internal class App
    {
        private readonly Trainer _trainer;
        private readonly Shop _shop = new();
        private readonly Battle _battle = new();
        private readonly WildEncounter _encounter = new();

        public App(Trainer trainer)
        {
            _trainer = trainer;
        }

        public void Run()
        {
            Console.WriteLine($"\nVelkommen, {_trainer.Name}! La eventyret begynne! ");

            while (true)
            {
                Console.WriteLine("\n=== HVA VIL DU GJØRE? ===");
                Console.WriteLine("1) Gå i gressmark");
                Console.WriteLine("2) Gå til vannet");
                Console.WriteLine("3) Besøk Pokeshop");
                Console.WriteLine("4) Se pokemon");
                Console.WriteLine("5) Se inventory");
                Console.WriteLine("Q) Avslutt");
                Console.Write("> ");

                ConsoleKeyInfo menuChoice = Console.ReadKey(true);
                switch (menuChoice.Key)
                {
                    case ConsoleKey.D1: Explore("gress"); break;
                    case ConsoleKey.D2: Explore("vann"); break;
                    case ConsoleKey.D3: _shop.Visit(_trainer); break;
                    case ConsoleKey.D4: _trainer.ShowParty(); break;
                    case ConsoleKey.D5: _trainer.ShowInventory(); break;
                    case ConsoleKey.Q: Console.WriteLine("Ha det! "); return;
                    default: Console.WriteLine("Ugyldig valg."); break;
                }
            }
        }

        private void Explore(string terrain)
        {
            Console.WriteLine($"\nDu utforsker {terrain}...");
            var wild = _encounter.Roll(terrain);

            if (wild == null)
                Console.WriteLine("\nDet var stille... ingen pokemon i nærheten.");
            else
                _battle.Start(_trainer, wild);
        }
    }
}
