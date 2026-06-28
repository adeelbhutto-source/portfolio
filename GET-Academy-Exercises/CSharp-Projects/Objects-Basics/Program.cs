using System;

namespace MyFirstProgram
{
    class Program
    {
        static void Main(string[] args)
        {

            Human human1 = new Human();
            Human human2= new Human();



            human1.name = "John";
            human1.age = 30;

            human2.name = "Alice";
            human2.age = 25;


            human1.Eat();
            human1.Sleep();

            human2.Eat();
            human2.Sleep();

            Console.ReadKey();
        }
    }

    class Human
    {
        public String name;
        public int age;

        public void Eat()
        {
            Console.WriteLine(name + " Eating...");
        }

        public void Sleep()
        {
            Console.WriteLine(name + " Sleeping...");
        }
    }
}
