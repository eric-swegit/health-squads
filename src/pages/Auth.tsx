
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Ange din e-postadress");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      toast.success("En länk för att återställa lösenordet har skickats till din e-post!");
      setShowForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Kunde inte skicka återställningslänk");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      toast.success("Inloggningen lyckades!");
    } catch (error: any) {
      toast.error(error.message || "Inloggning misslyckades");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // Check if we got a user back from the signup
      if (data.user) {
        // Insert the user into the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: formData.name,
            email: formData.email,
          });
          
        if (profileError) throw profileError;
      }
      
      toast.success("Registrering lyckades! Du kan nu logga in.");
    } catch (error: any) {
      toast.error(error.message || "Registrering misslyckades");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Health Squads</h1>
        
        {showForgotPassword ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Ange din e-postadress så skickar vi en länk för att återställa ditt lösenord.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <Input
                type="email"
                placeholder="E-post"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Skickar..." : "Skicka återställningslänk"}
              </Button>
            </form>
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              className="w-full text-sm text-muted-foreground hover:underline"
            >
              Tillbaka till inloggning
            </button>
          </div>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Logga in</TabsTrigger>
              <TabsTrigger value="register">Registrera</TabsTrigger>
            </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input 
                  type="email" 
                  name="email"
                  placeholder="E-post" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input 
                  type="password" 
                  name="password"
                  placeholder="Lösenord" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Loggar in..." : "Logga in"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Input 
                  type="text" 
                  name="name"
                  placeholder="Namn" 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input 
                  type="email" 
                  name="email"
                  placeholder="E-post" 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Input 
                  type="password" 
                  name="password"
                  placeholder="Lösenord" 
                  required 
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Registrerar..." : "Registrera"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
