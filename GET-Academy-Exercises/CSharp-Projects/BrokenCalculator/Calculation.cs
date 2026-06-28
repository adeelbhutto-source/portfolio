namespace BrokenCalculator
{
    class Calculation
    {
        public int Number1 { get; private set; }
        public int Number2 { get; private set; }
        public string Operation { get; private set; }
        public int Result { get; private set; }

        public Calculation(int number1, int number2, string operation, int result)
        {
            Number1 = number1;
            Number2 = number2;
            Operation = operation;
            Result = result;
        }
    }
}
