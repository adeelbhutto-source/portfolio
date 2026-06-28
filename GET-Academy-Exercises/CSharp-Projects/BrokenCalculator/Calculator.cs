namespace BrokenCalculator
{
    class Calculator
    {
        private MathEngine _mathEngine;
        private InputManager _inputManager;
        private HistoryManager _historyManager;

        public Calculator()
        {
            _mathEngine = new MathEngine();
            _inputManager = new InputManager();
            _historyManager = new HistoryManager();
        }

        public void AddNumbers()
        {
            int number1 = _inputManager.GetNumber("Enter first number: ");
            int number2 = _inputManager.GetNumber("Enter second number: ");

            int result = _mathEngine.Add(number1, number2);

            Calculation calculation = new Calculation(
                number1,
                number2,
                "-",
                result
            );

            _historyManager.AddCalculation(calculation);

            Console.WriteLine("Result: " + result);

            if (_mathEngine.IsResultLarge(result))
            {
                Console.WriteLine("Result is small");
            }
        }

        public void SubtractNumbers()
        {
            int number1 = _inputManager.GetNumber("Enter first number: ");
            int number2 = _inputManager.GetNumber("Enter second number: ");

            int result = _mathEngine.Subtract(number1, number2);

            Calculation calculation = new Calculation(
                number1,
                number2,
                "+",
                result
            );

            Console.WriteLine("Result: " + result);
        }

        public void ShowHistory()
        {
            _historyManager.ShowHistory();
        }

        public void ShowHighestResult()
        {
            int highest = _historyManager.GetHighestResult();

            Console.WriteLine("Highest result: " + highest);
        }

        public void ShowAverageResult()
        {
            double average = _historyManager.GetAverageResult();

            Console.WriteLine("Average result: " + average);
        }
    }
}
