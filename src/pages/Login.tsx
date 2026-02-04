import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Label } from '@/components/ui';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Always succeed and redirect to dash
    navigate('/dash');
  };

  const handleConsoleAccess = () => {
    navigate('/console');
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Scan className="h-10 w-10" />
            <span className="text-3xl font-bold tracking-tight">Face Sign</span>
          </div>
          <p className="text-gray-500">Document signing with facial authentication</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@organization.ae"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Access */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Demo Access</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dash')}
              className="w-full"
            >
              Client Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={handleConsoleAccess}
              className="w-full"
            >
              ICP Console
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Part of the UAE KYC Platform
        </p>
      </div>
    </div>
  );
}
