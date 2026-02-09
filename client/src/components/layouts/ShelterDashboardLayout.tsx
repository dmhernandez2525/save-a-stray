import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Query } from "@apollo/client/react/components";
import { ApolloConsumer, ApolloClient } from "@apollo/client";
import Queries from "../../graphql/queries";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { IsLoggedInData } from "../../types";
import VerificationBadge from "../VerificationBadge";
import {
  PawPrint, LayoutDashboard, Users, ClipboardList, Calendar, Heart,
  Settings, LogOut, Menu, ChevronLeft, ChevronRight, Building2,
  Stethoscope, DollarSign, Bell, MessageSquare, FileText, Upload,
  Scale, Syringe, Scissors, FileInput, FileOutput, UserCheck,
  CreditCard, Megaphone, Cpu, Activity, BarChart3
} from "lucide-react";

const { IS_LOGGED_IN } = Queries;

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  href?: string;
  section?: string;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
      { label: "Analytics", icon: BarChart3, section: "analytics" },
      { label: "Activity Feed", icon: Activity, section: "activity" },
    ],
  },
  {
    title: "Animals",
    items: [
      { label: "All Animals", icon: PawPrint, section: "animals" },
      { label: "Add Animal", icon: PawPrint, href: "/newAnimal" },
      { label: "Bulk Import", icon: Upload, section: "bulk-import" },
    ],
  },
  {
    title: "Medical",
    items: [
      { label: "Vaccinations", icon: Syringe, section: "vaccinations" },
      { label: "Weight Tracking", icon: Scale, section: "weight" },
      { label: "Spay/Neuter", icon: Scissors, section: "spay-neuter" },
      { label: "Behavior Notes", icon: FileText, section: "behavior" },
    ],
  },
  {
    title: "Applications",
    items: [
      { label: "All Applications", icon: ClipboardList, section: "applications" },
      { label: "Templates", icon: FileText, section: "templates" },
    ],
  },
  {
    title: "People",
    items: [
      { label: "Staff", icon: Users, section: "staff" },
      { label: "Volunteers", icon: UserCheck, section: "volunteers" },
      { label: "Fosters", icon: Heart, section: "fosters" },
    ],
  },
  {
    title: "Communications",
    items: [
      { label: "Messages", icon: MessageSquare, section: "messages" },
      { label: "Announcements", icon: Megaphone, section: "announcements" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Donations", icon: DollarSign, section: "donations" },
      { label: "Adoption Fees", icon: CreditCard, section: "fees" },
      { label: "Terminal Readers", icon: Cpu, section: "terminal" },
    ],
  },
  {
    title: "Records",
    items: [
      { label: "Intake Logs", icon: FileInput, section: "intake" },
      { label: "Outcome Logs", icon: FileOutput, section: "outcome" },
      { label: "Microchips", icon: Cpu, section: "microchips" },
    ],
  },
  {
    title: "Events",
    items: [
      { label: "Calendar", icon: Calendar, section: "calendar" },
    ],
  },
];

interface ShelterDashboardLayoutProps {
  children: React.ReactNode;
  shelterName?: string;
  verified?: boolean;
  verifiedAt?: string;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

const ShelterDashboardLayout: React.FC<ShelterDashboardLayoutProps> = ({
  children,
  shelterName = "Shelter",
  verified,
  verifiedAt,
  activeSection = "dashboard",
  onSectionChange,
}) => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (item: NavItem) => {
    if (item.href) {
      navigate(item.href);
    } else if (item.section && onSectionChange) {
      onSectionChange(item.section);
    }
    setMobileMenuOpen(false);
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? "" : sidebarCollapsed ? "w-16" : "w-64"}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className={`flex items-center ${sidebarCollapsed && !mobile ? "justify-center" : "gap-3"}`}>
          <div className="w-10 h-10 rounded-xl bg-salmon-100 dark:bg-salmon-900/30 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-salmon-600 dark:text-salmon-400" />
          </div>
          {(!sidebarCollapsed || mobile) && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold truncate">{shelterName}</h2>
                <VerificationBadge verified={verified} verifiedAt={verifiedAt} />
              </div>
              <p className="text-xs text-muted-foreground">Shelter Dashboard</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_GROUPS.map((group, groupIdx) => (
          <div key={group.title} className={groupIdx > 0 ? "mt-6" : ""}>
            {(!sidebarCollapsed || mobile) && (
              <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.title}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.section === activeSection;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                      isActive
                        ? "bg-sky-blue-100 dark:bg-sky-blue-900/30 text-sky-blue-700 dark:text-sky-blue-300"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    } ${sidebarCollapsed && !mobile ? "justify-center" : ""}`}
                    title={sidebarCollapsed && !mobile ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {(!sidebarCollapsed || mobile) && (
                      <>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <ApolloConsumer>
          {(client: ApolloClient<object>) => (
            <div className={`space-y-2 ${sidebarCollapsed && !mobile ? "flex flex-col items-center" : ""}`}>
              {(!sidebarCollapsed || mobile) && (
                <Link to="/settings">
                  <Button variant="ghost" className="w-full justify-start gap-3">
                    <Settings className="h-5 w-5" />
                    Settings
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                className={`${sidebarCollapsed && !mobile ? "" : "w-full justify-start"} gap-3 text-destructive hover:text-destructive`}
                onClick={() => {
                  localStorage.removeItem("auth-token");
                  client.writeQuery({
                    query: IS_LOGGED_IN,
                    data: { isLoggedIn: false },
                  });
                  navigate("/");
                }}
                title={sidebarCollapsed && !mobile ? "Logout" : undefined}
              >
                <LogOut className="h-5 w-5" />
                {(!sidebarCollapsed || mobile) && "Logout"}
              </Button>
            </div>
          )}
        </ApolloConsumer>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex col-start-1 col-end-6 row-start-1 row-end-4 pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r bg-card transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"}`}>
        <SidebarContent />
        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute left-[calc(16rem-12px)] top-20 w-6 h-6 rounded-full bg-background border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-all lg:flex hidden"
          style={{ left: sidebarCollapsed ? "52px" : "244px" }}
        >
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SidebarContent mobile />
            </SheetContent>
          </Sheet>

          {/* Breadcrumb / Title */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <Link to="/Shelter" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            {activeSection !== "dashboard" && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="font-medium capitalize">
                  {activeSection.replace(/-/g, " ")}
                </span>
              </>
            )}
          </div>

          {/* Logo on Mobile */}
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <PawPrint className="h-6 w-6 text-sky-blue-500" />
            <span className="font-capriola text-lg">Save Your Stray</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-salmon-400 rounded-full" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-salmon-100 text-salmon-700 text-sm">
                {shelterName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ShelterDashboardLayout;
