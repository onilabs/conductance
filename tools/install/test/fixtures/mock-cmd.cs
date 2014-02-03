using System;
 
public class PrintArgs
{
    static void Main(string[] args)
    {
        string dest = Environment.GetEnvironmentVariable("LOG");
        
        using (System.IO.StreamWriter file = new System.IO.StreamWriter(dest)) {
            foreach (string arg in args) {
                file.WriteLine(arg);
            }
        }
    }
}
