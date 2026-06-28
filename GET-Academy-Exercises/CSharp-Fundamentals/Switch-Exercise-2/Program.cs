using System;

class Program
{
    static void Main(string[] args)
    {
        bool ferdig = false;

        while (!ferdig)
        {
            Console.WriteLine("Skriv inn et tall fra 1 til 7:");
            string input = Console.ReadLine();

            if (int.TryParse(input, out int dag))
            {
                switch (dag)
                {
                    case 1:
                        Console.WriteLine("Mandag");
                        ferdig = true;
                        break;
                    case 2:
                        Console.WriteLine("Tirsdag");
                        ferdig = true;
                        break;
                    case 3:
                        Console.WriteLine("Onsdag");
                        ferdig = true;
                        break;
                    case 4:
                        Console.WriteLine("Torsdag");
                        ferdig = true;
                        break;
                    case 5:
                        Console.WriteLine("Fredag");
                        ferdig = true;
                        break;
                    case 6:
                        Console.WriteLine("Lørdag");
                        ferdig = true;
                        break;
                    case 7:
                        Console.WriteLine("Søndag");
                        ferdig = true;
                        break;
                    default:
                        Console.WriteLine("Tallet må være mellom 1 og 7.");
                        break;
                }
            }
            else
            {
                Console.WriteLine("Det der er ikke et tall.");
            }
        }

        Console.ReadLine();
    }
}
