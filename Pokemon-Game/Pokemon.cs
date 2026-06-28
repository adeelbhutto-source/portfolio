namespace Pokemon
{
    internal class Pokemon
    {
        public int Id { get; private set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public int MaxHp { get; set; }
        public int Hp { get; set; }
        public int Attack { get; set; }
        public int Defense { get; set; }
        public List<Move> Moves { get; }
        public bool IsFainted => Hp <= 0;

        public Pokemon(string name, string type, int hp, int attack, int defense, List<Move> moves)
        {
            Name = name;
            Type = type;
            MaxHp = hp;
            Hp = hp;
            Attack = attack;
            Defense = defense;
            Moves = moves;
        }

        public void TakeDamage(int amount)
        {
            Hp = Math.Max(0, Hp - amount);
        }

        public void Heal(int amount)
        {
            Hp = Math.Min(MaxHp, Hp + amount);
        }

        public void PrintStatus()
        {
            Console.WriteLine($"  {Name} [{Type}] — HP: {Hp}/{MaxHp}");
        }
    }
}
