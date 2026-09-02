/** SPORTIX style note: dark, cinematic SportsTech shell; the supplied unaltered wordmark is the sole brand logo. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import { useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { trpc } from "./lib/trpc";
import AuthGateway from "./pages/AuthGateway";
import Home from "./pages/Home";
import PartnerProfile from "./pages/PartnerProfile";
import Inquiries from "./pages/Inquiries";
import Opportunity from "./pages/Opportunity";
import MembershipRequests from "./pages/MembershipRequests";
import Marketplace from "./pages/Marketplace";
import MarketplaceCart from "./pages/MarketplaceCart";
import MarketplaceCheckout from "./pages/MarketplaceCheckout";
import GoSportix from "./pages/GoSportix";
import IndividualAccess from "./pages/IndividualAccess";
import NdaUpload from "./pages/NdaUpload";
import NdaPendingApproval from "./pages/NdaPendingApproval";
import NdaReview from "./pages/NdaReview";
import NdaApprove from "./pages/NdaApprove";
import AdminApprovalLogin from "./pages/AdminApprovalLogin";
import ProtectedWatermark from "./components/ProtectedWatermark";
import { canBypassPartnerGateway } from "./pages/homeAccess";
import { isAdminPath, isPartnerGatewayPath } from "./pages/individualAccessRoute";
function Router() {
  const [location] = useLocation();
  const partnerSession = trpc.partnerAuth.session.useQuery();
  const projectSession = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const isProjectAdmin = canBypassPartnerGateway(projectSession.data?.role);

  if (isAdminPath(location)) {
    if (projectSession.isLoading) return <IndividualAccess />;
    if (!isProjectAdmin) return <AdminApprovalLogin />;
    return <><ProtectedWatermark /><Switch>
      <Route path="/admin/memberships" component={MembershipRequests} />
      <Route path="/admin/inquiries" component={Inquiries} />
      <Route path="/admin/nda-review" component={NdaReview} />
      <Route path="/admin/nda-approve" component={NdaApprove} />
      <Route component={NotFound} />
    </Switch></>;
  }

  // SPORTIX administrators authenticate through Manus OAuth, not the separate partner-password gateway.
  // The server remains the authority for all protected administrator operations.
  if (location === "/partner-access/nda") return <NdaUpload />;
  if (location === "/partner-access/pending") return <NdaPendingApproval />;
  if (isPartnerGatewayPath(location)) return <AuthGateway onAuthenticated={() => { void utils.partnerAuth.session.invalidate(); window.location.assign("/"); }} />;
  if (projectSession.isLoading || partnerSession.isLoading) return <IndividualAccess />;
  if (isProjectAdmin && location === "/") return <><ProtectedWatermark /><Home isProjectAdmin /></>;
  if (!partnerSession.data) return <IndividualAccess />;
  if (partnerSession.data.status !== "approved") return <IndividualAccess />;

  return (
    <><ProtectedWatermark /><Switch>
        <Route path="/" component={() => <Home />} />
        <Route path="/profile" component={PartnerProfile} />
        <Route path="/opportunity" component={Opportunity} />
        <Route path="/go-sportix" component={GoSportix} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/marketplace/cart" component={MarketplaceCart} />
        <Route path="/marketplace/checkout" component={MarketplaceCheckout} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch></>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
