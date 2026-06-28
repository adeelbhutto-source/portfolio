namespace MovieBookCatalog
{
    internal class Program
    {
        static void Main(string[] args)
        {
            Menu menu = new Menu();

            menu.Run();
            
            Console.ReadKey();
        }
    }
}
