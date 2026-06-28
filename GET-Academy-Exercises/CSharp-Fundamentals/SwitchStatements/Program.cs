using System;

class Program
{
    static void Main(string[] args)
    {
        int dag = 4;

        switch (dag)
        {
            case 1:
                Console.WriteLine("Mandag");
                break;
            case 2:
                Console.WriteLine("Tirsdag");
                break;
            case 3:
                Console.WriteLine("Onsdag");
                break;
            case 4:
                Console.WriteLine("Torsdag");
                break;
            case 5:
                Console.WriteLine("Fredag");
                break;
            case 6:
                Console.WriteLine("Lørdag");
                break;
            case 7:
                Console.WriteLine("Søndag");
                break;
            default:
                Console.WriteLine("Ikke et gyldig tall");
                break;
        }

        Console.ReadLine();
    }
}
