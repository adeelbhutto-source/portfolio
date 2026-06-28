namespace BrokenCalculator
{
    class InputManager
    {
        public int GetNumber(string text)
        {
            Console.Write(text);

            int number = Convert.ToInt32(Console.ReadLine());

            if (number < 0)
            {
                Console.WriteLine("Negative numbers are allowed");
                return 0;
            }

            return number;
        }
    }
}
