using System;

class Program
{
    static void GenererHobby(string navn)
    {
        string[] hobbyer = { "Fiske", "Gaming", "Strikking", "Fotball", "Koding" };

        Random maskin = new Random();
        int tilfeldigTall = maskin.Next(hobbyer.Length);

        Console.WriteLine(navn + " sin nye hobby er " + hobbyer[tilfeldigTall] + "!");
    }

    static void Main(string[] args)
    {
        Console.Write("Skriv inn navnet ditt: ");
        string inputNavn = Console.ReadLine();

        GenererHobby(inputNavn);

        Console.ReadLine();
    }
}
