namespace Pokemon
{
    internal class Trainer
    {
        public string Name { get; set; }
        public List<Pokemon> Party { get; set; } = new();
        public List<Item> Inventory { get; set; } = new();
        public int Money { get; private set; } = 500;

        public Trainer(string name, Pokemon starter)
        {
            Name = name;
            Party.Add(starter);

            Inventory.Add(new Item("Pokeball", ItemType.Pokeball, 10));
            Inventory.Add(new Item("Pokeball", ItemType.Pokeball, 10));
            Inventory.Add(new Item("Pokeball", ItemType.Pokeball, 10));
            Inventory.Add(new Item("Health potion", ItemType.Potion, 20));
        }

        public bool HasUsablePokemon => Party.Any(p => !p.IsFainted);

        public void SpendMoney(int amount) => Money -= amount;

        public void EarnMoney(int amount) => Money += amount;

        public int CountItem(ItemType type) =>
            Inventory.Count(i => i.Type == type);

        public Item? TakeItem(ItemType type)
        {
            var item = Inventory.FirstOrDefault(i => i.Type == type);
            if (item != null) Inventory.Remove(item);
            return item;
        }

        public void ShowParty()
        {
            Console.WriteLine($"=== {Name}s Pokemon ===");
            foreach (var p in Party)
                p.PrintStatus();
        }

        public void ShowInventory()
        {
            Console.WriteLine($"=== Inventory === (Penger: {Money}$)");
            Console.WriteLine($"  Pokeballs: {CountItem(ItemType.Pokeball)}");
            Console.WriteLine($"  Health potions:   {CountItem(ItemType.Potion)}");
        }
    }
}
