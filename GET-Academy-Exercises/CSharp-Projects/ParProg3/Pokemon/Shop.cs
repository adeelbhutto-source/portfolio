namespace Pokemon
{
    internal class Shop
    {
        private readonly Dictionary<string, (Item item, int price)> _stock = new()
        {
            ["1"] = (new Item("Pokeball", ItemType.Pokeball, 10), 50),
            ["2"] = (new Item("Health potion", ItemType.Potion, 20), 80),
        };

        public void Visit(Trainer trainer)
        {
            Console.WriteLine("\n=== POKESHOP ===");
            bool shopping = true;

            while (shopping)
            {
                Console.WriteLine($"Penger: {trainer.Money}$");
                Console.WriteLine("1) Pokeball  — 50$");
                Console.WriteLine("2) Health potion    — 80$");
                Console.WriteLine("Q) Forlat butikken");
                Console.Write("> ");

                string choice = Console.ReadKey(true).KeyChar.ToString().ToUpperInvariant();

                if (choice == "Q") { shopping = false; break; }

                if (_stock.TryGetValue(choice, out var entry))
                {
                    if (trainer.Money >= entry.price)
                    {
                        trainer.SpendMoney(entry.price);
                        trainer.Inventory.Add(new Item(entry.item.Name, entry.item.Type, entry.item.Value));
                        Console.WriteLine($"Kjøpte {entry.item.Name}!");
                    }
                    else
                    {
                        Console.WriteLine("Ikke nok penger!");
                    }
                }
                else
                {
                    Console.WriteLine("Ugyldig valg.");
                }
            }
        }
    }
}
