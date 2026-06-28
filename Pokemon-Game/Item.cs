namespace Pokemon
{
    public enum ItemType { Pokeball, Potion }

    internal class Item
    {
        public string Name { get; set; }
        public ItemType Type { get; set; }
        public int Value { get; set; }

        public Item(string name, ItemType type, int value)
        {
            Name = name;
            Type = type;
            Value = value;
        }
    }
}
