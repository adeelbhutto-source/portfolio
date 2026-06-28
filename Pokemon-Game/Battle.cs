namespace Pokemon
{
    internal class Battle
    {
        private readonly Random _rng = new();

        public void Start(Trainer trainer, Pokemon wild)
        {
            Console.WriteLine($"\nEn vill {wild.Name} dukket opp!");
            Pokemon? active = trainer.Party.FirstOrDefault(p => !p.IsFainted);
            if (active == null) { Console.WriteLine("\nDu har ingen pokemon som kan kjempe!"); return; }

            Console.WriteLine($"\nGår ut: {active.Name}");
            bool inBattle = true;

            while (inBattle && !active.IsFainted && !wild.IsFainted)
            {
                Console.WriteLine();
                active.PrintStatus();
                wild.PrintStatus();
                Console.WriteLine("\n1) Angrip");
                Console.WriteLine("2) Bruk Potion");
                Console.WriteLine("3) Kast Pokeball");
                Console.WriteLine("4) Løp");
                Console.Write("> ");

                ConsoleKeyInfo combatChoice = Console.ReadKey(true);
                switch (combatChoice.Key)
                {
                    case ConsoleKey.D1:
                        PlayerAttacks(active, wild);
                        if (!wild.IsFainted) EnemyAttacks(wild, active);
                        break;

                    case ConsoleKey.D2:
                        var potion = trainer.TakeItem(ItemType.Potion);
                        if (potion != null)
                        {
                            active.Heal(potion.Value);
                            Console.WriteLine($"\nHealet {active.Name} med {potion.Value} HP!");
                            EnemyAttacks(wild, active);
                        }
                        else Console.WriteLine("\nIngen potions igjen!");
                        break;

                    case ConsoleKey.D3:
                        var ball = trainer.TakeItem(ItemType.Pokeball);
                        if (ball != null)
                        {
                            int catchChance = 40 + ball.Value + (100 - wild.Hp * 100 / wild.MaxHp) / 2;
                            if (_rng.Next(100) < catchChance)
                            {
                                Console.WriteLine($"\nDu fanget {wild.Name}!");
                                trainer.Party.Add(wild);
                                inBattle = false;
                            }
                            else
                            {
                                Console.WriteLine($"\n{wild.Name} brøt fri!");
                                EnemyAttacks(wild, active);
                            }
                        }
                        else Console.WriteLine("\nIngen pokeballs igjen!");
                        break;

                    case ConsoleKey.D4:
                        if (_rng.Next(100) < 60)
                        {
                            Console.WriteLine("\nDu rømte!");
                            inBattle = false;
                        }
                        else Console.WriteLine($"\n{wild.Name} blokkerte flukten!");
                        break;

                    default:
                        Console.WriteLine("\nUgyldig valg.");
                        break;
                }
            }

            if (wild.IsFainted)
            {
                int reward = _rng.Next(20, 60);
                Console.WriteLine($"\n{wild.Name} besvimte! Du fikk {reward}$");
                trainer.EarnMoney(reward);
            }
            if (active.IsFainted)
                Console.WriteLine($"\n{active.Name} har besvimt...");
        }

        private void PlayerAttacks(Pokemon attacker, Pokemon target)
        {
            if (attacker.Moves.Count == 0) return;
            var move = attacker.Moves[_rng.Next(attacker.Moves.Count)];

            if (_rng.Next(100) < move.Accuracy)
            {
                int dmg = Math.Max(1, attacker.Attack + move.Power - target.Defense);
                target.TakeDamage(dmg);
                Console.WriteLine($"\n{attacker.Name} brukte {move.Name} og gjorde {dmg} skade!");
            }
            else Console.WriteLine($"\n{attacker.Name} bommet!");
        }

        private void EnemyAttacks(Pokemon enemy, Pokemon target)
        {
            if (enemy.Moves.Count == 0) return;
            var move = enemy.Moves[new Random().Next(enemy.Moves.Count)];
            int dmg = Math.Max(1, enemy.Attack + move.Power - target.Defense);
            target.TakeDamage(dmg);
            Console.WriteLine($"\n{enemy.Name} angriper med {move.Name} og gjorde {dmg} skade!");
        }
    }
}
