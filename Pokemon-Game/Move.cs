namespace Pokemon
{
    internal class Move
    {
        public string Name { get; set; }
        public int Power { get; set; }
        public int Accuracy { get; set; }

        public Move(string name, int power, int accuracy)
        {
            Name = name;
            Power = power;
            Accuracy = accuracy;
        }
    }
}
