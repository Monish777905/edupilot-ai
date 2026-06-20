import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import ConceptSimplifier from "./pages/ConceptSimplifier";
import QuizGenerator from "./pages/QuizGenerator";
import DoubtSolver from "./pages/DoubtSolver";
import StoryMode from "./pages/StoryMode";
import LessonPlanner from "./pages/LessonPlanner";
import Whiteboard from "./pages/Whiteboard";
import ActivityGuide from "./pages/ActivityGuide";
import Translation from "./pages/Translation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      )} />
      <Route path="/concept-simplifier" component={() => (
        <DashboardLayout>
          <ConceptSimplifier />
        </DashboardLayout>
      )} />
      <Route path="/quiz-generator" component={() => (
        <DashboardLayout>
          <QuizGenerator />
        </DashboardLayout>
      )} />
      <Route path="/doubt-solver" component={() => (
        <DashboardLayout>
          <DoubtSolver />
        </DashboardLayout>
      )} />
      <Route path="/story-mode" component={() => (
        <DashboardLayout>
          <StoryMode />
        </DashboardLayout>
      )} />
      <Route path="/lesson-planner" component={() => (
        <DashboardLayout>
          <LessonPlanner />
        </DashboardLayout>
      )} />
      <Route path="/whiteboard" component={() => (
        <DashboardLayout>
          <Whiteboard />
        </DashboardLayout>
      )} />
      <Route path="/activity-guide" component={() => (
        <DashboardLayout>
          <ActivityGuide />
        </DashboardLayout>
      )} />
      <Route path="/translation" component={() => (
        <DashboardLayout>
          <Translation />
        </DashboardLayout>
      )} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
