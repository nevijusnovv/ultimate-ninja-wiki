import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Wiki from "@/pages/wiki";
import ArticleDetail from "@/pages/article";
import Rules from "@/pages/rules";
import Ranks from "@/pages/ranks";
import Lore from "@/pages/lore";
import AdminIndex from "@/pages/admin/index";
import AdminNew from "@/pages/admin/new";
import AdminEdit from "@/pages/admin/edit";
import AdminSections from "@/pages/admin/sections";
import AdminLore from "@/pages/admin/lore";
import AdminGuard from "@/components/admin-guard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/wiki" component={Wiki} />
      <Route path="/wiki/:id" component={ArticleDetail} />
      <Route path="/rules" component={Rules} />
      <Route path="/ranks" component={Ranks} />
      <Route path="/lore" component={Lore} />
      <Route path="/admin">
        <AdminGuard><AdminIndex /></AdminGuard>
      </Route>
      <Route path="/admin/new">
        <AdminGuard><AdminNew /></AdminGuard>
      </Route>
      <Route path="/admin/edit/:id">
        <AdminGuard><AdminEdit /></AdminGuard>
      </Route>
      <Route path="/admin/sections">
        <AdminGuard><AdminSections /></AdminGuard>
      </Route>
      <Route path="/admin/lore">
        <AdminGuard><AdminLore /></AdminGuard>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
