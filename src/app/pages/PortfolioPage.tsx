
import { ExecutiveMode } from './ExecutiveMode';

// Always render the same dashboard page for "/". Lens only affects UI affordances inside ExecutiveMode.
export function PortfolioPage() {
  return <ExecutiveMode />;
}
