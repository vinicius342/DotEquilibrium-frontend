import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, Save, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { apiService, UserProfile, UpdateProfileData, ChangePasswordData } from "@/lib/api";

const MeusDados = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await apiService.getUserProfile();
        setProfile(profileData);
        setFormData(prev => ({
          ...prev,
          firstName: profileData.first_name || "",
          lastName: profileData.last_name || "",
          email: profileData.email || "",
        }));
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do perfil.",
          variant: "destructive",
        });
      }
    };

    loadProfile();
  }, [toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Erro",
        description: "Nome e sobrenome são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateData: UpdateProfileData = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
      };

      const updatedProfile = await apiService.updateUserProfile(updateData);
      setProfile(updatedProfile);
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de senha.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const passwordData: ChangePasswordData = {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
        confirm_password: formData.confirmPassword,
      };

      await apiService.changePassword(passwordData);
      
      // Limpar campos de senha
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setShowPasswordChange(false);

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso!",
      });
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      
      // Tratar erros específicos da API
      let errorMessage = "Não foi possível alterar a senha. Tente novamente.";
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.current_password) {
          errorMessage = "Senha atual incorreta.";
        } else if (errorData.new_password) {
          errorMessage = errorData.new_password[0] || errorMessage;
        } else if (errorData.confirm_password) {
          errorMessage = "As senhas não coincidem.";
        }
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-center">Meus Dados</h1>
            <p className="text-muted-foreground text-center">Gerencie suas informações pessoais e configurações de conta</p>
          </div>
        </div>

        {/* Card Central Único */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <User size={24} />
                Perfil do Usuário
              </CardTitle>
              <CardDescription>
                Gerencie todas as suas informações pessoais e configurações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Seção: Informações Pessoais */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <User size={18} />
                  <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Seu sobrenome"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado pois é usado para login
                  </p>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="w-full flex items-center gap-2"
                >
                  <Save size={16} />
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>

              {/* Seção: Segurança */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Lock size={18} />
                  <h3 className="text-lg font-semibold">Segurança</h3>
                </div>
                
                {!showPasswordChange ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      Sua senha está protegida. Clique no botão abaixo para alterá-la.
                    </p>
                    <Button 
                      onClick={() => setShowPasswordChange(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Lock size={16} />
                      Alterar Senha
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        placeholder="Digite sua senha atual"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange("newPassword", e.target.value)}
                          placeholder="Digite sua nova senha"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          placeholder="Confirme sua nova senha"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={handleChangePassword}
                        disabled={isLoading}
                        className="flex-1 flex items-center gap-2"
                      >
                        <Save size={16} />
                        {isLoading ? "Alterando..." : "Alterar Senha"}
                      </Button>
                      <Button 
                        onClick={() => {
                          setShowPasswordChange(false);
                          setFormData(prev => ({
                            ...prev,
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          }));
                        }}
                        variant="outline"
                        disabled={isLoading}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Seção: Informações da Conta */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Mail size={18} />
                  <h3 className="text-lg font-semibold">Informações da Conta</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">ID do Usuário</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{profile?.id || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">E-mail de Login</Label>
                    <p className="text-sm bg-muted p-2 rounded">{profile?.email || "N/A"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status da Conta</Label>
                    <p className={`text-sm p-2 rounded inline-block ${
                      profile?.is_active 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {profile?.is_active ? "✓ Ativa" : "✗ Inativa"}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Membro desde</Label>
                    <p className="text-sm bg-muted p-2 rounded">
                      {profile?.date_joined 
                        ? new Date(profile.date_joined).toLocaleDateString('pt-BR')
                        : "N/A"
                      }
                    </p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MeusDados;
