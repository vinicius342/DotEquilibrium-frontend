import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Container, Row, Col } from 'react-bootstrap';
import {
    LayoutDashboard,
    Wallet,
    TrendingUp,
    Users,
    Target,
    User,
    LogOut,
    CircleUserRound,
    CircleUserRoundIcon,
    CircleUser,
    Bell
} from "lucide-react";

const Header = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <Link to="/dashboard">
                            <h1 className="text-2xl font-bold hover:text-primary">
                                DotEquilibrium
                            </h1>
                        </Link>
                    </div>

                    <div className="flex items-center" style={{ marginLeft: '5rem', justifyContent: 'space-between', width: '100%' }}>
                        <nav className="hidden md:flex gap-2">
                            <Link to="/dashboard">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center gap-2 ${isActive("/dashboard")
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "text-gray-300 hover:bg-blue-500/20 hover:text-blue-400"
                                        }`}
                                >
                                    <LayoutDashboard size={16} />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/receitas-despesas">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center gap-2 ${isActive("/receitas-despesas")
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "text-gray-300 hover:bg-blue-500/20 hover:text-blue-400"
                                        }`}
                                >
                                    <Wallet size={16} />
                                    Carteira
                                </Button>
                            </Link>
                            <Link to="/investimentos">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center gap-2 ${isActive("/investimentos")
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "text-gray-300 hover:bg-blue-500/20 hover:text-blue-400"
                                        }`}
                                >
                                    <TrendingUp size={16} />
                                    Investimentos
                                </Button>
                            </Link>
                            <Link to="/folha-pagamento">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center gap-2 ${isActive("/folha-pagamento")
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "text-gray-300 hover:bg-blue-500/20 hover:text-blue-400"
                                        }`}
                                >
                                    <Users size={16} />
                                    Folha de Pagamento
                                </Button>
                            </Link>
                            <Link to="/objetivos">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center gap-2 ${isActive("/objetivos")
                                        ? "bg-blue-500 text-white hover:bg-blue-600"
                                        : "text-gray-300 hover:bg-blue-500/20 hover:text-blue-400"
                                        }`}
                                >
                                    <Target size={16} />
                                    Objetivos
                                </Button>
                            </Link>
                        </nav>

                        <div className="flex">
                            <DropdownMenu>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center text-gray-300 hover:bg-blue-500/20 hover:text-blue-400 ml-2"
                                    style={{ borderRadius: 50 }}
                                    aria-label="Notificações"
                                >
                                    <Bell size={22} />
                                </Button>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex items-center gap-2 text-gray-300 hover:bg-blue-500/20 hover:text-blue-400"
                                        style={{ borderRadius: 50 }}
                                    >
                                        <CircleUserRound size={20} style={{ height: 25, width: 25 }} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                        <User size={16} />
                                        Meus Dados
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="flex items-center gap-2 cursor-pointer text-destructive hover:text-destructive"
                                        onClick={logout}
                                    >
                                        <LogOut size={16} />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
