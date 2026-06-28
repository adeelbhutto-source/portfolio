namespace Pokemon
{
    internal class WildEncounter
    {
        private readonly Random _rng = new();

        private readonly Dictionary<string, List<Pokemon>> _terrainPokemon = new()
        {
            ["gress"] = new List<Pokemon>
        {
            new("Bulbasaur", "gress", 45, 12, 8,  new List<Move> { new("Vine Whip", 10, 85), new("Tackle", 6, 95) }),
            new("Pidgey",    "flyvende", 40, 10, 6, new List<Move> { new("Gust", 8, 90) }),
            new("Rattata",   "normal", 35, 11, 5, new List<Move> { new("Scratch", 7, 95) }),
        },
            ["vann"] = new List<Pokemon>
        {
            new("Squirtle",  "vann", 44, 11, 10, new List<Move> { new("Water Gun", 10, 85), new("Tackle", 6, 95) }),
            new("Magikarp",  "vann", 20, 4,  4,  new List<Move> { new("Splash", 0, 100) }),
            new("Tentacool", "vann", 40, 9,  7,  new List<Move> { new("Acid", 9, 80) }),
        }
        };

        public Pokemon? Roll(string terrain)
        {
            if (_rng.Next(100) >= 70) return null;

            if (!_terrainPokemon.TryGetValue(terrain, out var pool)) return null;

            var template = pool[_rng.Next(pool.Count)];
            return new Pokemon(template.Name, template.Type, template.MaxHp,
                               template.Attack, template.Defense, template.Moves);
        }
    }
}
