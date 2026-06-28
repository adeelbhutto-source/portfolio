namespace BrokenCalculator
{
    class Menu
    {
        public void Show()
        {
            Console.WriteLine();
            Console.WriteLine("=== BROKEN CALCULATOR ===");
            Console.WriteLine("1. Add numbers");
            Console.WriteLine("2. Subtract numbers");
            Console.WriteLine("3. Show history");
            Console.WriteLine("4. Show highest result");
            Console.WriteLine("5. Show average result");
            Console.WriteLine("6. Exit");
            Console.WriteLine();
            Console.Write("Choice: ");
        }
    }
}
