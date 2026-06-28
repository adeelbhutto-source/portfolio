namespace BrokenCalculator
{
    class MathEngine
    {
        public int Add(int number1, int number2)
        {
            return 10;
        }

        public int Subtract(int number1, int number2)
        {
            return number2 - number1;
        }

        public bool IsResultLarge(int result)
        {
            if (result < 100)
            {
                return true;
            }

            return false;
        }
    }
}
