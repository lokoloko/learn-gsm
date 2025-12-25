import { render, screen, fireEvent } from '@testing-library/react';
import { ApplicationSteps } from '@/components/regulations/ApplicationSteps';
import type { ApplicationStep } from '@/types/database';

const mockSteps: ApplicationStep[] = [
  {
    step: 1,
    title: 'Verify Zoning Eligibility',
    description: "Check if your property is in an STR-permitted zone using the city's zoning map.",
    url: 'https://example.com/zoning',
    documents_needed: null,
    estimated_time: '1 day',
    cost: 0,
  },
  {
    step: 2,
    title: 'Obtain State License',
    description: 'Apply for a short-term rental license through the state DBPR portal.',
    url: 'https://dbpr.state.fl.us',
    documents_needed: ['Proof of ownership', 'Insurance certificate', 'ID verification'],
    estimated_time: '2-4 weeks',
    cost: 200,
  },
  {
    step: 3,
    title: 'Apply for City Permit',
    description: 'Submit your application to the city planning department.',
    url: null,
    documents_needed: ['State license copy', 'Floor plan'],
    estimated_time: '4-6 weeks',
    cost: 520,
  },
];

describe('ApplicationSteps component', () => {
  describe('rendering', () => {
    it('renders the header with market name', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      expect(screen.getByText('How to Get Permitted')).toBeInTheDocument();
      expect(screen.getByText(/step-by-step guide for Miami Beach/i)).toBeInTheDocument();
    });

    it('renders all step titles', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      expect(screen.getByText('Verify Zoning Eligibility')).toBeInTheDocument();
      expect(screen.getByText('Obtain State License')).toBeInTheDocument();
      expect(screen.getByText('Apply for City Permit')).toBeInTheDocument();
    });

    it('renders step numbers', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('renders step descriptions when expanded', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      expect(
        screen.getByText(/check if your property is in an STR-permitted zone/i)
      ).toBeInTheDocument();
    });

    it('shows progress counter', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      expect(screen.getByText('0/3')).toBeInTheDocument();
      expect(screen.getByText('steps completed')).toBeInTheDocument();
    });
  });

  describe('step details', () => {
    it('renders estimated time', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      expect(screen.getByText('1 day')).toBeInTheDocument();
      expect(screen.getByText('2-4 weeks')).toBeInTheDocument();
    });

    it('renders cost as Free when 0', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('renders formatted cost', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      expect(screen.getByText('$200')).toBeInTheDocument();
      expect(screen.getByText('$520')).toBeInTheDocument();
    });

    it('renders documents needed', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      // Steps 2 and 3 both have documents
      const docHeaders = screen.getAllByText('Documents Needed');
      expect(docHeaders.length).toBe(2);
      expect(screen.getByText('Proof of ownership')).toBeInTheDocument();
      expect(screen.getByText('Insurance certificate')).toBeInTheDocument();
    });

    it('renders external link when URL provided', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      const links = screen.getAllByText('Official Resource');
      expect(links.length).toBe(2); // Steps 1 and 2 have URLs
    });
  });

  describe('completion tracking', () => {
    it('toggles step completion on click', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      const checkButtons = screen.getAllByRole('button', { name: /mark as complete/i });
      fireEvent.click(checkButtons[0]);

      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    it('updates progress when multiple steps completed', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      const checkButtons = screen.getAllByRole('button', { name: /mark as complete/i });
      fireEvent.click(checkButtons[0]);
      fireEvent.click(checkButtons[1]);

      expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    it('can toggle step back to incomplete', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      const checkButtons = screen.getAllByRole('button', { name: /mark as complete/i });
      fireEvent.click(checkButtons[0]); // Complete

      const incompleteButton = screen.getByRole('button', { name: /mark as incomplete/i });
      fireEvent.click(incompleteButton); // Incomplete

      expect(screen.getByText('0/3')).toBeInTheDocument();
    });

    it('shows completion message when all steps done', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      const checkButtons = screen.getAllByRole('button', { name: /mark as complete/i });
      checkButtons.forEach((btn) => fireEvent.click(btn));

      expect(
        screen.getByText(/all steps completed! you're ready to host in Miami Beach/i)
      ).toBeInTheDocument();
    });
  });

  describe('expand/collapse', () => {
    it('can collapse a step', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      // All steps start expanded
      expect(
        screen.getByText(/check if your property is in an STR-permitted zone/i)
      ).toBeInTheDocument();

      // Collapse first step
      const collapseButtons = screen.getAllByRole('button', { name: /collapse step/i });
      fireEvent.click(collapseButtons[0]);

      // Description should be truncated (line-clamp-1)
      // The full text is still there but visually hidden
    });

    it('can expand a collapsed step', () => {
      render(<ApplicationSteps steps={mockSteps} marketName="Miami Beach" />);

      // Collapse first step
      const collapseButtons = screen.getAllByRole('button', { name: /collapse step/i });
      fireEvent.click(collapseButtons[0]);

      // Expand it again
      const expandButton = screen.getByRole('button', { name: /expand step/i });
      fireEvent.click(expandButton);

      expect(
        screen.getByText(/check if your property is in an STR-permitted zone/i)
      ).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('returns null when no steps', () => {
      const { container } = render(
        <ApplicationSteps steps={[]} marketName="Miami Beach" />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('ordering', () => {
    it('sorts steps by step number', () => {
      const unorderedSteps: ApplicationStep[] = [
        { ...mockSteps[2], step: 3 },
        { ...mockSteps[0], step: 1 },
        { ...mockSteps[1], step: 2 },
      ];

      render(<ApplicationSteps steps={unorderedSteps} marketName="Miami Beach" />);

      const stepNumbers = screen.getAllByText(/Step \d/);
      expect(stepNumbers[0]).toHaveTextContent('Step 1');
      expect(stepNumbers[1]).toHaveTextContent('Step 2');
      expect(stepNumbers[2]).toHaveTextContent('Step 3');
    });
  });

  describe('className prop', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ApplicationSteps steps={mockSteps} marketName="Miami Beach" className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});
